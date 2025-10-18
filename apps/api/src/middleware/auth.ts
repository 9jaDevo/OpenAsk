import { Request, Response, NextFunction } from 'express';
import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import { config } from '../config.js';

// Extend Express Request to include auth payload
declare global {
    namespace Express {
        interface Request {
            auth?: AuthResult;
            user?: {
                sub: string;
                email?: string;
                name?: string;
            };
        }
    }
}

// Configure JWT validation
const checkJwt = auth({
    audience: config.auth0Audience,
    issuerBaseURL: `https://${config.auth0Domain}/`,
    tokenSigningAlg: 'RS256',
});

// Required authentication middleware
export const authRequired = [
    checkJwt,
    (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Extract user info from token payload
        req.user = {
            sub: req.auth.payload.sub as string,
            email: req.auth.payload.email as string | undefined,
            name: req.auth.payload.name as string | undefined,
        };

        next();
    },
];

// Optional authentication middleware (continues without auth)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without auth
        return next();
    }

    // Token provided, validate it
    return checkJwt(req, res, (err) => {
        if (err) {
            // Invalid token, continue without auth
            return next();
        }

        // Valid token, attach user info
        if (req.auth) {
            req.user = {
                sub: req.auth.payload.sub as string,
                email: req.auth.payload.email as string | undefined,
                name: req.auth.payload.name as string | undefined,
            };
        }

        next();
    });
};
