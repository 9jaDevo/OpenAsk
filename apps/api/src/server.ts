import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { config } from './config.js';
import { logger } from './logger.js';
import { getDBHealthStatus } from './db.js';

export const app = express();

// Trust proxy if production
if (config.isProduction) {
    app.set('trust proxy', 1);
}

// Disable x-powered-by
app.disable('x-powered-by');

// Security headers
app.use(helmet());

// CORS configuration
// Support both single origin and comma-separated multiple origins
const allowedOrigins = config.webOrigin.split(',').map((origin) => origin.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, or Vercel health checks)
            if (!origin) return callback(null, true);

            // Check if origin is in allowed list
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn({ origin, allowedOrigins }, 'CORS blocked request from unauthorized origin');
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);;

// Request logging
app.use(pinoHttp({ logger }));

// Body parsing with limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression
app.use(compression());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
    const dbHealth = getDBHealthStatus();
    const isHealthy = dbHealth.connected;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        database: {
            connected: dbHealth.connected,
            state: dbHealth.state,
        },
    });
});

// API routes
import { apiRouter } from './routes/index.js';
app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
    });
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);

    const statusCode = (err as any).statusCode || (err as any).status || 500;
    const message = config.isProduction && statusCode === 500
        ? 'Internal Server Error'
        : err.message;

    res.status(statusCode).json({
        error: err.name || 'Error',
        message,
        ...(config.isDevelopment && { stack: err.stack }),
    });
});
