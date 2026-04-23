/**
 * Pagination utilities
 */

export interface PaginationOptions {
    page: number;
    limit: number;
    total: number;
}

export const getPaginationParams = (
    query: any,
): { limit: number; offset: number } => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const offset = (page - 1) * limit;

    return { limit, offset };
};

export const formatPaginationResponse = (
    total: number,
    limit: number,
    offset: number,
): PaginationOptions => {
    const page = Math.floor(offset / limit) + 1;
    const pages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total: Math.min(total, limit),
    };
};
