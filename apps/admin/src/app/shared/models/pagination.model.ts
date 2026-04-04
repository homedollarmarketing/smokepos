/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
    page: number;
    limit: number;
    search?: string;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Pagination metadata from API
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Paginated response from API
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Helper to create default pagination query
 */
export function createPaginationQuery(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT
): PaginationQuery {
    return {
        page: Math.max(1, page),
        limit: Math.min(Math.max(1, limit), MAX_LIMIT),
    };
}
