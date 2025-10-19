import { app } from './server.js';
import { connectDB } from './db.js';
import { logger } from './logger.js';

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

// Ensure DB connection before handling requests
app.use(async (_req, _res, next) => {
    await ensureConnection();
    next();
});

// Export the Express app as default for Vercel
export default app;
