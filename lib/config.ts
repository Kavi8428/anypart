/**
 * Application Configuration Constants
 * Centralized configuration to avoid magic numbers and hardcoded values
 */

export const APP_CONFIG = {
    // Pagination
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
        SEARCH_RESULTS_LIMIT: 8,
        FEATURED_PRODUCTS_LIMIT: 10,
    },

    // Session
    SESSION: {
        ADMIN_EXPIRY_DAYS: 1,
        SELLER_EXPIRY_DAYS: 7,
        BUYER_EXPIRY_DAYS: 7,
    },

    // Password
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: false,
    },

    // Phone
    PHONE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15,
    },

    // File Upload
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        IMAGE_QUALITY: 85,
    },

    // Rate Limiting (for future implementation)
    RATE_LIMIT: {
        LOGIN_ATTEMPTS: 5,
        LOGIN_WINDOW_MINUTES: 15,
        API_REQUESTS_PER_MINUTE: 60,
    },

    // OTP
    OTP: {
        LENGTH: 6,
        EXPIRY_MINUTES: 10,
        MAX_ATTEMPTS: 3,
    },

    // Payment
    PAYMENT: {
        FEATURED_PRODUCT_PRICE: 2500, // LKR
        CURRENCY: 'LKR',
    },
} as const;

/**
 * Environment-specific configuration
 */
export const ENV = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * API Routes
 */
export const API_ROUTES = {
    PAYMENTS: {
        NOTIFY: '/api/payments/notify',
    },
    BUYER: {
        DETAILS: (id: number) => `/api/buyer/details/${id}`,
    },
} as const;

/**
 * Public Routes (no authentication required)
 */
export const PUBLIC_ROUTES = [
    '/',
    '/buyer',
    '/buyer/categories',
    '/buyer/product_view',
    '/seller/login',
    '/seller/register',
    '/admin/login',
] as const;

/**
 * Protected Routes
 */
export const PROTECTED_ROUTES = {
    ADMIN: ['/admin'],
    SELLER: ['/seller'],
    BUYER: ['/buyer/profile', '/buyer/orders', '/buyer/chat'],
} as const;
