import { Router, Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApiError, sendSuccess } from '../middleware/error.middleware';

const router = Router();

/**
 * Upload Routes - Only call services, no business logic
 * All routes follow: /api/v1/uploads/*
 */

/**
 * POST /api/v1/uploads
 * Upload a file (protected)
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new ApiError(400, 'No files provided'));
        }

        const file = req.files.file;
        const filename = await UploadService.saveFile(file);
        const url = UploadService.getFileUrl(filename);

        sendSuccess(res, { filename, url }, 201);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/uploads/:filename
 * Delete a file (protected)
 */
router.delete('/:filename', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UploadService.deleteFile(req.params.filename);
        sendSuccess(res, { success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
