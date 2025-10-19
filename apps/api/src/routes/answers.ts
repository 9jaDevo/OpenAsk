import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema, createPaginationResult, calculateSkip } from '../utils/pagination.js';
import { sanitizeMarkdown } from '../utils/sanitize.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { User } from '../models/User.js';
import { Vote } from '../models/Vote.js';

const router = Router();

// Validation schemas
const createAnswerSchema = z.object({
    body: z.string().min(20),
});

const updateAnswerSchema = z.object({
    body: z.string().min(20),
});

const questionIdSchema = z.object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
});

const answerIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid answer ID'),
});

const listAnswersQuerySchema = paginationSchema.extend({
    sort: z.enum(['new', 'votes']).optional().default('votes'),
});

// GET /api/v1/questions/:questionId/answers - List answers for a question
router.get(
    '/:questionId/answers',
    optionalAuth,
    validate({ params: questionIdSchema, query: listAnswersQuerySchema }),
    async (req: Request, res: Response) => {
        try {
            const { questionId } = req.params;
            const query = req.query as Record<string, any>;
            const { page, limit, sort } = query as { page: number; limit: number; sort: 'new' | 'votes' };

            // Check if question exists
            const question = await Question.findById(questionId);
            if (!question) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Question not found',
                });
            }

            // Determine sort
            const sortOption: any = sort === 'votes' ? { voteCount: -1, createdAt: -1 } : { createdAt: -1 };

            const skip = calculateSkip({ page, limit });
            const [answers, totalCount] = await Promise.all([
                Answer.find({ question: questionId }).sort(sortOption).skip(skip).limit(limit).lean(),
                Answer.countDocuments({ question: questionId }),
            ]);

            // Get user votes if authenticated
            let userVotes: Record<string, 1 | -1> = {};
            if (req.user) {
                const votes = await Vote.find({
                    targetType: 'answer',
                    targetId: { $in: answers.map((a) => a._id) },
                    userId: req.user.sub,
                }).lean();
                userVotes = votes.reduce((acc, vote) => {
                    acc[vote.targetId.toString()] = vote.value;
                    return acc;
                }, {} as Record<string, 1 | -1>);
            }

            const items = answers.map((a) => ({
                _id: a._id.toString(),
                questionId: a.question.toString(),
                body: a.body,
                author: {
                    sub: a.authorSub,
                    name: a.authorName,
                },
                voteCount: a.voteCount,
                userVote: userVotes[a._id.toString()] || null,
                createdAt: a.createdAt,
                updatedAt: a.updatedAt,
            }));

            const result = createPaginationResult(items, totalCount, { page, limit });
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to fetch answers',
            });
        }
    }
);

// POST /api/v1/questions/:questionId/answers - Create answer
router.post(
    '/:questionId/answers',
    authRequired,
    validate({ params: questionIdSchema, body: createAnswerSchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { questionId } = req.params;
            const { body } = req.body;

            // Check if question exists
            const question = await Question.findById(questionId);
            if (!question) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Question not found',
                });
            }

            // Sanitize markdown
            const sanitizedBody = sanitizeMarkdown(body);

            // Find or create user
            let user = await User.findOne({ sub: req.user.sub });
            if (!user) {
                user = await User.create({
                    sub: req.user.sub,
                    email: req.user.email || undefined,
                    name: req.user.name,
                });
            }

            // Create answer
            const answer = await Answer.create({
                question: questionId,
                body: sanitizedBody,
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            // Update question answer count
            question.answerCount += 1;
            await question.save();

            res.status(201).json({
                _id: answer._id.toString(),
                questionId: answer.question.toString(),
                body: answer.body,
                author: {
                    sub: answer.authorSub,
                    name: answer.authorName,
                },
                voteCount: answer.voteCount,
                userVote: null,
                createdAt: answer.createdAt,
                updatedAt: answer.updatedAt,
            });
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to create answer',
            });
        }
    }
);

// PATCH /api/v1/answers/:id - Update answer
router.patch(
    '/:id',
    authRequired,
    validate({ params: answerIdSchema, body: updateAnswerSchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { id } = req.params;
            const { body } = req.body;

            const answer = await Answer.findById(id);
            if (!answer) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Answer not found',
                });
            }

            // Check ownership
            if (answer.authorSub !== req.user.sub) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only edit your own answers',
                });
            }

            // Sanitize markdown
            answer.body = sanitizeMarkdown(body);
            await answer.save();

            // Get user vote
            const vote = await Vote.findOne({
                targetType: 'answer',
                targetId: answer._id,
                userId: req.user.sub,
            }).lean();

            res.json({
                _id: answer._id.toString(),
                questionId: answer.question.toString(),
                body: answer.body,
                author: {
                    sub: answer.authorSub,
                    name: answer.authorName,
                },
                voteCount: answer.voteCount,
                userVote: vote ? vote.value : null,
                createdAt: answer.createdAt,
                updatedAt: answer.updatedAt,
            });
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to update answer',
            });
        }
    }
);

export { router as answersRouter };
