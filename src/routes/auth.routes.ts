import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendSuccess, errorMiddleware } from '../middleware/error.middleware';

const router = Router();

/**
 * Auth Routes - Only call services, no business logic
 * All routes follow: /api/v1/auth/*
 */

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.register(req.body);
        sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/auth/me
 * Get current user (protected)
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.getCurrentUser(req.userId!);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
});

export default router;
