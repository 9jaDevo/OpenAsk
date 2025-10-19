import { app } from '../src/server.js';
import { connectDB } from '../src/db.js';
import { logger } from '../src/logger.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Connect to MongoDB (Vercel will cache this connection)
let isConnected = false;

async function ensureConnection() {
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
            logger.info('MongoDB connected for Vercel serverless');
        } catch (error) {
            logger.error(error, 'Failed to connect to MongoDB');
            throw error;
        }
    }
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    await ensureConnection();
    
    // Pass the request to Express
    return app(req as any, res as any);
}
