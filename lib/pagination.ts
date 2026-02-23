/**
 * Pagination Utilities
 * Provides consistent pagination across the application
 */

import { APP_CONFIG } from './config';

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Validates and normalizes pagination parameters
 */
export function normalizePagination(params: PaginationParams = {}): {
    page: number;
    limit: number;
    skip: number;
} {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(
        Math.max(1, params.limit || APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE),
        APP_CONFIG.PAGINATION.MAX_PAGE_SIZE
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Creates pagination metadata
 */
export function createPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * Creates a paginated response
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> {
    return {
        data,
        pagination: createPaginationMeta(page, limit, total),
    };
}

/**
 * Calculates offset for SQL-style pagination
 */
export function calculateOffset(page: number, limit: number): number {
    return (Math.max(1, page) - 1) * limit;
}
