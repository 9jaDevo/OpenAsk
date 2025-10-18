import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from './logger.js';

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

export const connectDB = async (): Promise<void> => {
    if (isConnected) {
        logger.info('MongoDB already connected');
        return;
    }

    const connect = async (): Promise<void> => {
        try {
            connectionAttempts++;
            logger.info(`Connecting to MongoDB (attempt ${connectionAttempts})...`);

            await mongoose.connect(config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            isConnected = true;
            connectionAttempts = 0;
            logger.info('✅ MongoDB connected successfully');
        } catch (error) {
            logger.error(error, `MongoDB connection failed (attempt ${connectionAttempts})`);

            if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
                logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                return connect();
            } else {
                logger.error('Max retry attempts reached. Exiting...');
                process.exit(1);
            }
        }
    };

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
        logger.error(error, 'MongoDB connection error');
    });

    mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        isConnected = true;
    });

    await connect();
};

export const disconnectDB = async (): Promise<void> => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.connection.close();
        isConnected = false;
        logger.info('MongoDB disconnected gracefully');
    } catch (error) {
        logger.error(error, 'Error disconnecting from MongoDB');
        throw error;
    }
};

export const getDBHealthStatus = (): { connected: boolean; state: string } => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

    return {
        connected: state === 1,
        state: states[state] || 'unknown',
    };
};
