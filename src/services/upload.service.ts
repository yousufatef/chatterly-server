import path from 'path';
import fs from 'fs/promises';
import env from '../config/env';
import { throwApiError } from '../middleware/error.middleware';

/**
 * Upload Service - Contains ALL business logic for file uploads
 * Routes call this service, routes never contain logic
 */

export const UploadService = {
    async saveFile(file: any): Promise<string> {
        if (!file) {
            throwApiError(400, 'No file provided');
        }

        if (file.size > env.MAX_FILE_SIZE) {
            throwApiError(413, `File size exceeds maximum of ${env.MAX_FILE_SIZE} bytes`);
        }

        try {
            // Ensure upload directory exists
            await fs.mkdir(env.UPLOAD_DIR, { recursive: true });

            // Generate unique filename
            const filename = `${Date.now()}-${file.name}`;
            const filepath = path.join(env.UPLOAD_DIR, filename);

            // Save file
            await fs.writeFile(filepath, file.data);

            return filename;
        } catch (error) {
            throwApiError(500, 'Failed to save file');
        }
    },

    async deleteFile(filename: string): Promise<void> {
        try {
            const filepath = path.join(env.UPLOAD_DIR, filename);

            // Security: prevent directory traversal
            if (!filepath.startsWith(env.UPLOAD_DIR)) {
                throwApiError(400, 'Invalid file path');
            }

            await fs.unlink(filepath);
        } catch (error) {
            throwApiError(500, 'Failed to delete file');
        }
    },

    getFileUrl(filename: string): string {
        return `/api/v1/uploads/${filename}`;
    },
};
