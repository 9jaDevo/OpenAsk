import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().url(),
    WEB_ORIGIN: z.string().url(),
    AUTH0_DOMAIN: z.string(),
    AUTH0_AUDIENCE: z.string(),
    GEMINI_API_KEY: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX: z.string().default('100'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const config = {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    mongoUri: parsed.data.MONGODB_URI,
    webOrigin: parsed.data.WEB_ORIGIN,
    auth0Domain: parsed.data.AUTH0_DOMAIN,
    auth0Audience: parsed.data.AUTH0_AUDIENCE,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    rateLimit: {
        windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
        max: parseInt(parsed.data.RATE_LIMIT_MAX, 10),
    },
    logLevel: parsed.data.LOG_LEVEL,
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isProduction: parsed.data.NODE_ENV === 'production',
    isTest: parsed.data.NODE_ENV === 'test',
} as const;
