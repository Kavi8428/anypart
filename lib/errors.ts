/**
 * Standardized Error Response Format
 * Use this across all server actions and API routes for consistent error handling
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Creates a success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Creates an error response
 */
export function errorResponse(message: string, errors?: Record<string, string[]>): ApiResponse {
    return {
        success: false,
        message,
        errors,
    };
}

/**
 * Creates a validation error response
 */
export function validationError(errors: Record<string, string[]>): ApiResponse {
    return {
        success: false,
        message: 'Validation failed',
        errors,
    };
}

/**
 * Handles errors in server actions
 * Logs the error server-side and returns user-friendly message
 */
export function handleServerError(error: unknown, context: string): ApiResponse {
    // Log full error server-side
    console.error(`[${context}] Error:`, error);

    // Return generic message to client (never expose internal errors in production)
    if (process.env.NODE_ENV === 'production') {
        return errorResponse('An unexpected error occurred. Please try again.');
    }

    // In development, provide more details
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Development Error: ${message}`);
}

/**
 * Custom application errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(
        message: string = 'Validation failed',
        public validationErrors?: Record<string, string[]>
    ) {
        super(message, 422, 'VALIDATION_ERROR');
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}
