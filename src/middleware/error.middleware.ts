import { Request, Response, NextFunction } from 'express';

/**
 * API Response shape for all endpoints
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Global error handler middleware
 * Ensures all errors follow the ApiResponse shape
 */
export const errorMiddleware = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const isDev = process.env.NODE_ENV === 'development';

    if (err instanceof ApiError) {
        const response: ApiResponse = {
            success: false,
            error: err.message,
        };
        return res.status(err.statusCode).json(response);
    }

    // Unhandled errors
    const response: ApiResponse = {
        success: false,
        error: isDev ? err.message : 'Internal server error',
    };

    console.error('❌ Unhandled error:', err);
    return res.status(500).json(response);
};

/**
 * Utility to send success responses
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode = 200,
    pagination?: ApiResponse['pagination'],
) => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        ...(pagination && { pagination }),
    };
    res.status(statusCode).json(response);
};

/**
 * Utility to throw API errors
 */
export const throwApiError = (statusCode: number, message: string, code?: string) => {
    throw new ApiError(statusCode, message, code);
};
