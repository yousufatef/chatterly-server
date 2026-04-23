import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApiError, sendSuccess } from '../middleware/error.middleware';

const router = Router();

/**
 * User Routes - Only call services, no business logic
 * All routes follow: /api/v1/users/*
 */

/**
 * GET /api/v1/users/search
 * Search users by query
 * NOTE: Must be before /:userId to avoid route conflict
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, limit } = req.query;
        const users = await UserService.searchUsers(
            (q as string) || '',
            parseInt(limit as string) || 10,
        );
        sendSuccess(res, users);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/users/online
 * Get all online users
 * NOTE: Must be before /:userId to avoid route conflict
 */
router.get('/online', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserService.getOnlineUsers();
        sendSuccess(res, users);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/users/username/:username
 * Get user by username
 */
router.get('/username/:username', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUserByUsername(req.params.username);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/users/:userId
 * Get user by ID
 */
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUser(req.params.userId);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/users/:userId
 * Update user (protected)
 */
router.put('/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Users can only update themselves
        if (req.userId !== req.params.userId) {
            return next(new ApiError(403, 'Cannot update other users'));
        }

        const user = await UserService.updateUser(req.params.userId, req.body);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
});

export default router;
