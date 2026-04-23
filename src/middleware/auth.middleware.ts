import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { throwApiError } from './error.middleware';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throwApiError(401, 'Missing authorization token');
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.userId = decoded.id;
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throwApiError(401, 'Invalid token');
        }
        throw error;
    }
};
