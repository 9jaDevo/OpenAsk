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

// POST /api/v1/answers/:id/vote OR /api/v1/questions/:id/vote
// This route handles both answer and question votes based on the base URL
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

            // Determine if this is a question or answer vote based on baseUrl
            const isAnswerVote = req.baseUrl.includes('/answers');
            const targetType: VoteTargetType = isAnswerVote ? 'answer' : 'question';

            // Find the target document
            const target = isAnswerVote ? await Answer.findById(id) : await Question.findById(id);

            if (!target) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: `${isAnswerVote ? 'Answer' : 'Question'} not found`,
                });
            }

            // Handle the vote
            await handleVote(targetType, id, req.user.sub, value);

            // Recalculate vote count
            const voteCount = await calculateVoteCount(targetType, id);
            target.voteCount = voteCount;
            await target.save();

            // Get user's current vote
            const userVote = await Vote.findOne({
                targetType,
                targetId: id,
                userId: req.user.sub,
            }).lean();

            res.json({
                voteCount,
                userVote: userVote ? userVote.value : null,
            });
        } catch (error: unknown) {
            const err = error as { code?: number };
            if (err.code === 11000) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Vote conflict, please try again',
                });
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to process vote',
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
