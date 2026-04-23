import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env';

/**
 * Socket authentication middleware
 * Validates JWT token from handshake query/auth
 */
export const socketAuthMiddleware = (socket: Socket, next: any) => {
    try {
        const token =
            socket.handshake.auth.token ||
            socket.handshake.query.token;

        if (!token) {
            return next(new Error('Missing authentication token'));
        }

        const decoded = jwt.verify(token as string, env.JWT_SECRET) as any;

        // Attach user data to socket
        socket.data.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new Error('Invalid token'));
        }
        next(error);
    }
};
