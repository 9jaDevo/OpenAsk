import { app } from './server.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { connectDB, disconnectDB } from './db.js';

// Connect to MongoDB
await connectDB();

const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`📍 API available at http://localhost:${config.port}`);
    logger.info(`🔒 CORS enabled for ${config.webOrigin}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
        try {
            await disconnectDB();
            logger.info('Server closed');
            process.exit(0);
        } catch (error) {
            logger.error(error, 'Error during shutdown');
            process.exit(1);
        }
    });

    // Force shutdown after 10s
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error(error, 'Uncaught exception');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason, 'Unhandled rejection');
    process.exit(1);
});
