import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema, createPaginationResult, calculateSkip } from '../utils/pagination.js';
import { sanitizeMarkdown } from '../utils/sanitize.js';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { Vote } from '../models/Vote.js';
import { generateDraftAnswer } from '../services/ai/gemini.js';

const router = Router();

// Validation schemas
const createQuestionSchema = z.object({
    title: z.string().min(10).max(160),
    body: z.string().min(20),
    tags: z.array(z.string()).min(1).max(5),
});

const updateQuestionSchema = z.object({
    title: z.string().min(10).max(160).optional(),
    body: z.string().min(20).optional(),
    tags: z.array(z.string()).min(1).max(5).optional(),
});

const listQuestionsQuerySchema = paginationSchema.extend({
    q: z.string().optional(),
    tag: z.string().optional(),
    sort: z.enum(['new', 'votes', 'answers']).optional().default('new'),
});

const questionIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
});

// GET /api/v1/questions - List questions
router.get(
    '/',
    optionalAuth,
    validate({ query: listQuestionsQuerySchema }),
    async (req: Request, res: Response) => {
        try {
            const queryParams = req.query as Record<string, any>;
            const { page, limit, q, tag, sort } = queryParams as {
                page: number;
                limit: number;
                q?: string;
                tag?: string;
                sort: 'new' | 'votes' | 'answers';
            };

            // Build query
            const mongoQuery: any = {};
            if (q) {
                mongoQuery.$text = { $search: q };
            }
            if (tag) {
                mongoQuery.tags = tag;
            }

            // Determine sort
            let sortOption: any = {};
            switch (sort) {
                case 'votes':
                    sortOption = { voteCount: -1, createdAt: -1 };
                    break;
                case 'answers':
                    sortOption = { answerCount: -1, createdAt: -1 };
                    break;
                case 'new':
                default:
                    sortOption = { createdAt: -1 };
            }

            const skip = calculateSkip({ page, limit });
            const [questions, totalCount] = await Promise.all([
                Question.find(mongoQuery).sort(sortOption).skip(skip).limit(limit).lean(),
                Question.countDocuments(mongoQuery),
            ]);

            // Get user votes if authenticated
            let userVotes: Record<string, 1 | -1> = {};
            if (req.user) {
                const votes = await Vote.find({
                    targetType: 'question',
                    targetId: { $in: questions.map((q) => q._id) },
                    userId: req.user.sub,
                }).lean();
                userVotes = votes.reduce((acc, vote) => {
                    acc[vote.targetId.toString()] = vote.value;
                    return acc;
                }, {} as Record<string, 1 | -1>);
            }

            const items = questions.map((q) => ({
                _id: q._id.toString(),
                title: q.title,
                body: q.body,
                tags: q.tags,
                author: {
                    sub: q.authorSub,
                    name: q.authorName,
                },
                voteCount: q.voteCount,
                answerCount: q.answerCount,
                userVote: userVotes[q._id.toString()] || null,
                createdAt: q.createdAt,
                updatedAt: q.updatedAt,
            }));

            const result = createPaginationResult(items, totalCount, { page, limit });
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to fetch questions',
            });
        }
    }
);

// POST /api/v1/questions - Create question
router.post(
    '/',
    authRequired,
    validate({ body: createQuestionSchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { title, body, tags } = req.body;

            // Sanitize markdown
            const sanitizedBody = sanitizeMarkdown(body);

            // Find or create user
            let user = await User.findOne({ sub: req.user.sub });
            if (!user) {
                user = await User.create({
                    sub: req.user.sub,
                    email: req.user.email || '',
                    name: req.user.name,
                });
            }

            // Generate AI draft answer
            const aiDraftAnswer = await generateDraftAnswer({ title, body: sanitizedBody });

            // Create question
            const question = await Question.create({
                title,
                body: sanitizedBody,
                tags,
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
                aiDraftAnswer,
            });

            res.status(201).json({
                _id: question._id.toString(),
                title: question.title,
                body: question.body,
                tags: question.tags,
                author: {
                    sub: question.authorSub,
                    name: question.authorName,
                },
                voteCount: question.voteCount,
                answerCount: question.answerCount,
                aiDraftAnswer: question.aiDraftAnswer,
                userVote: null,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
            });
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to create question',
            });
        }
    }
);

// GET /api/v1/questions/:id - Get question by ID
router.get(
    '/:id',
    optionalAuth,
    validate({ params: questionIdSchema }),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const question = await Question.findById(id).lean();
            if (!question) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Question not found',
                });
            }

            // Get user vote if authenticated
            let userVote: 1 | -1 | null = null;
            if (req.user) {
                const vote = await Vote.findOne({
                    targetType: 'question',
                    targetId: question._id,
                    userId: req.user.sub,
                }).lean();
                userVote = vote ? vote.value : null;
            }

            res.json({
                _id: question._id.toString(),
                title: question.title,
                body: question.body,
                tags: question.tags,
                author: {
                    sub: question.authorSub,
                    name: question.authorName,
                },
                voteCount: question.voteCount,
                answerCount: question.answerCount,
                aiDraftAnswer: question.aiDraftAnswer,
                userVote,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
            });
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to fetch question',
            });
        }
    }
);

// PATCH /api/v1/questions/:id - Update question
router.patch(
    '/:id',
    authRequired,
    validate({ params: questionIdSchema, body: updateQuestionSchema }),
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
            }

            const { id } = req.params;
            const updates = req.body;

            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Question not found',
                });
            }

            // Check ownership
            if (question.authorSub !== req.user.sub) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only edit your own questions',
                });
            }

            // Sanitize markdown if body is updated
            if (updates.body) {
                updates.body = sanitizeMarkdown(updates.body);
            }

            // Update question
            Object.assign(question, updates);
            await question.save();

            // Get user vote
            const vote = await Vote.findOne({
                targetType: 'question',
                targetId: question._id,
                userId: req.user.sub,
            }).lean();

            res.json({
                _id: question._id.toString(),
                title: question.title,
                body: question.body,
                tags: question.tags,
                author: {
                    sub: question.authorSub,
                    name: question.authorName,
                },
                voteCount: question.voteCount,
                answerCount: question.answerCount,
                aiDraftAnswer: question.aiDraftAnswer,
                userVote: vote ? vote.value : null,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
            });
        } catch (error) {
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to update question',
            });
        }
    }
);

export { router as questionsRouter };
