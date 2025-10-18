import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authRequired } from '../middleware/auth.js';
import { questionsRouter } from './questions.js';
import { answersRouter } from './answers.js';
import { votesRouter as questionVotesRouter } from './votes.js';
import { tagsRouter } from './tags.js';
import { searchRouter } from './search.js';
import { config } from '../config.js';

const router = Router();

// Rate limiter for write operations
const writeLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        error: 'TooManyRequests',
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/v1/profile - Get user profile
router.get('/profile', authRequired, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated',
            });
        }

        // Return user info from token
        // In a real app, you might fetch additional user data from the database
        res.json({
            sub: req.user.sub,
            email: req.user.email,
            name: req.user.name,
        });
    } catch (error) {
        res.status(500).json({
            error: 'InternalServerError',
            message: 'Failed to fetch profile',
        });
    }
});

// Mount routers
router.use('/questions', questionsRouter);
router.use('/answers', answersRouter);
router.use('/tags', tagsRouter);
router.use('/search', searchRouter);

// Apply rate limiting to write endpoints
router.post('/questions', writeLimiter);
router.patch('/questions/:id', writeLimiter);
router.post('/questions/:id/vote', writeLimiter);
router.post('/questions/:questionId/answers', writeLimiter);
router.patch('/answers/:id', writeLimiter);
router.post('/answers/:id/vote', writeLimiter);

// Vote routes (need to be after rate limiting middleware)
router.use('/questions', questionVotesRouter);
router.use('/answers', questionVotesRouter);

export { router as apiRouter };
