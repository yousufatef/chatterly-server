import { Router, Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendSuccess } from '../middleware/error.middleware';

const router = Router();

/**
 * Room Routes - Only call services, no business logic
 * All routes follow: /api/v1/rooms/*
 */

/**
 * POST /api/v1/rooms
 * Create new room (protected)
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const room = await RoomService.createRoom({
            ...req.body,
            createdBy: req.userId!,
        });
        sendSuccess(res, room, 201);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/rooms/:roomId
 * Get room details (protected)
 */
router.get('/:roomId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const room = await RoomService.getRoom(req.params.roomId, req.userId!);
        sendSuccess(res, room);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/rooms
 * Get rooms for current user (protected)
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rooms = await RoomService.getRoomsForUser(req.userId!);
        sendSuccess(res, rooms);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/rooms/:roomId/members/:userId
 * Add member to room (protected)
 */
router.post(
    '/:roomId/members/:userId',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await RoomService.addMember(
                req.params.roomId,
                req.params.userId,
                req.userId!,
            );
            sendSuccess(res, room);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * DELETE /api/v1/rooms/:roomId/members/:userId
 * Remove member from room (protected)
 */
router.delete(
    '/:roomId/members/:userId',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const room = await RoomService.removeMember(
                req.params.roomId,
                req.params.userId,
                req.userId!,
            );
            sendSuccess(res, room);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * PUT /api/v1/rooms/:roomId
 * Update room (protected, creator only)
 */
router.put('/:roomId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const room = await RoomService.updateRoom(req.params.roomId, req.body, req.userId!);
        sendSuccess(res, room);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/rooms/:roomId
 * Delete room (protected, creator only)
 */
router.delete('/:roomId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await RoomService.deleteRoom(req.params.roomId, req.userId!);
        sendSuccess(res, { success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
