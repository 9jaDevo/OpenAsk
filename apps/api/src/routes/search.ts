import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema, calculateSkip } from '../utils/pagination.js';
import { Question } from '../models/Question.js';
import { Vote } from '../models/Vote.js';

const router = Router();

// Validation schema
const searchQuerySchema = paginationSchema.extend({
    q: z.string().min(1).max(100),
    sort: z.enum(['relevance', 'new', 'votes']).optional().default('relevance'),
});

// GET /api/v1/search - Search questions
router.get('/', optionalAuth, validate({ query: searchQuerySchema }), async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as Record<string, any>;
        const { q, page, limit, sort } = queryParams as {
            q: string;
            page: number;
            limit: number;
            sort: 'relevance' | 'new' | 'votes';
        };

        // Build query
        const mongoQuery: any = { $text: { $search: q } };

        // Determine sort
        let sortOption: any = {};
        if (sort === 'relevance') {
            sortOption = { score: { $meta: 'textScore' }, voteCount: -1 };
        } else if (sort === 'votes') {
            sortOption = { voteCount: -1, createdAt: -1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const skip = calculateSkip({ page, limit });

        // If sorting by relevance, add text score to projection
        const projection = sort === 'relevance' ? { score: { $meta: 'textScore' } } : {};

        const [questions, totalCount] = await Promise.all([
            Question.find(mongoQuery, projection).sort(sortOption).skip(skip).limit(limit).lean(),
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

        // Return SDK-compatible pagination shape
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            questions: items,
            total: totalCount,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        res.status(500).json({
            error: 'InternalServerError',
            message: 'Failed to search questions',
        });
    }
});

export { router as searchRouter };
