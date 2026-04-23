import { Router, Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendSuccess } from '../middleware/error.middleware';

const router = Router();

/**
 * Message Routes - Only call services, no business logic
 * All routes follow: /api/v1/messages/*
 */

/**
 * POST /api/v1/messages
 * Create new message (protected)
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const message = await MessageService.createMessage({
            ...req.body,
            userId: req.userId!,
        });
        sendSuccess(res, message, 201);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/messages/room/:roomId
 * Get messages for a room (protected)
 */
router.get('/room/:roomId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, offset } = req.query;
        const result = await MessageService.getMessages(
            req.params.roomId,
            req.userId!,
            parseInt(limit as string) || 50,
            parseInt(offset as string) || 0,
        );
        sendSuccess(res, result.messages, 200, {
            page: Math.floor((parseInt(offset as string) || 0) / (parseInt(limit as string) || 50)) + 1,
            limit: parseInt(limit as string) || 50,
            total: result.total,
            pages: Math.ceil(result.total / (parseInt(limit as string) || 50)),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/messages/:messageId
 * Update message (protected, owner only)
 */
router.put('/:messageId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const message = await MessageService.updateMessage(
            req.params.messageId,
            req.userId!,
            req.body.content,
        );
        sendSuccess(res, message);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/messages/:messageId
 * Delete message (protected, owner only)
 */
router.delete('/:messageId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await MessageService.deleteMessage(req.params.messageId, req.userId!);
        sendSuccess(res, { success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
