import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { Question } from '../models/Question.js';

const router = Router();

// Validation schema
const tagsQuerySchema = z.object({
    limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val >= 1 && val <= 50, {
            message: 'Limit must be between 1 and 50',
        })
        .optional()
        .default('20'),
});

// GET /api/v1/tags/top - Get top tags by usage
router.get('/top', validate({ query: tagsQuerySchema }), async (req: Request, res: Response) => {
    try {
        const query = req.query as Record<string, any>;
        const { limit } = query as { limit: number };

        const topTags = await Question.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    tag: '$_id',
                    count: 1,
                },
            },
        ]);

        res.json({ tags: topTags });
    } catch (error) {
        res.status(500).json({
            error: 'InternalServerError',
            message: 'Failed to fetch top tags',
        });
    }
});

export { router as tagsRouter };
