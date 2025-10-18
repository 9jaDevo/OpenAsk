import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Vote, VoteTargetType } from '../models/Vote.js';

const router = Router();

// Validation schemas
const voteBodySchema = z.object({
    value: z.union([z.literal(1), z.literal(-1)]),
});

const voteParamsSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
});

// POST /api/v1/questions/:id/vote - Vote on question
router.post(
    '/:id/vote',
    authRequired,
    validate({ params: voteParamsSchema, body: voteBodySchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { id } = req.params;
            const { value } = req.body;

            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Question not found',
                });
            }

            await handleVote('question', id, req.user.sub, value);

            // Recalculate vote count
            const voteCount = await calculateVoteCount('question', id);
            question.voteCount = voteCount;
            await question.save();

            // Get user's current vote
            const userVote = await Vote.findOne({
                targetType: 'question',
                targetId: id,
                userId: req.user.sub,
            }).lean();

            res.json({
                voteCount,
                userVote: userVote ? userVote.value : null,
            });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Vote conflict, please try again',
                });
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to vote on question',
            });
        }
    }
);

// POST /api/v1/answers/:id/vote - Vote on answer
router.post(
    '/:id/vote',
    authRequired,
    validate({ params: voteParamsSchema, body: voteBodySchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { id } = req.params;
            const { value } = req.body;

            const answer = await Answer.findById(id);
            if (!answer) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Answer not found',
                });
            }

            await handleVote('answer', id, req.user.sub, value);

            // Recalculate vote count
            const voteCount = await calculateVoteCount('answer', id);
            answer.voteCount = voteCount;
            await answer.save();

            // Get user's current vote
            const userVote = await Vote.findOne({
                targetType: 'answer',
                targetId: id,
                userId: req.user.sub,
            }).lean();

            res.json({
                voteCount,
                userVote: userVote ? userVote.value : null,
            });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Vote conflict, please try again',
                });
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to vote on answer',
            });
        }
    }
);

// Helper function to handle vote logic
async function handleVote(targetType: VoteTargetType, targetId: string, userId: string, value: 1 | -1) {
    const existingVote = await Vote.findOne({ targetType, targetId, userId });

    if (existingVote) {
        if (existingVote.value === value) {
            // Remove vote (toggle off)
            await Vote.deleteOne({ _id: existingVote._id });
        } else {
            // Change vote
            existingVote.value = value;
            await existingVote.save();
        }
    } else {
        // New vote
        await Vote.create({ targetType, targetId, userId, value });
    }
}

// Helper function to calculate vote count
async function calculateVoteCount(targetType: VoteTargetType, targetId: string): Promise<number> {
    const votes = await Vote.find({ targetType, targetId }).lean();
    return votes.reduce((sum, vote) => sum + vote.value, 0);
}

export { router as votesRouter };
