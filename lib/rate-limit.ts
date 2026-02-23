/**
 * Simple Memory-Based Rate Limiter
 * Note: This is a basic implementation for a single-server environment.
 * For production with multiple instances, use Redis.
 */

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const cache = new Map<string, RateLimitInfo>();

/**
 * Checks if a request should be rate limited
 * @param key - Unique key for the requester (e.g., IP address or username)
 * @param limit - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns Object containing whether the request is limited and remaining attempts
 */
export function rateLimit(key: string, limit: number, windowMs: number): {
    isLimited: boolean;
    remaining: number;
    resetTime: number;
} {
    const now = Date.now();
    const info = cache.get(key);

    if (!info || now > info.resetTime) {
        // First request or window expired
        const newInfo = {
            count: 1,
            resetTime: now + windowMs,
        };
        cache.set(key, newInfo);
        return { isLimited: false, remaining: limit - 1, resetTime: newInfo.resetTime };
    }

    if (info.count >= limit) {
        // Rate limit exceeded
        return { isLimited: true, remaining: 0, resetTime: info.resetTime };
    }

    // Increment count
    info.count += 1;
    cache.set(key, info);
    return { isLimited: false, remaining: limit - info.count, resetTime: info.resetTime };
}

/**
 * Periodically cleans up expired entries from the cache
 */
export function cleanupRateLimitCache() {
    const now = Date.now();
    for (const [key, info] of cache.entries()) {
        if (now > info.resetTime) {
            cache.delete(key);
        }
    }
}

// Automatically cleanup every 15 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitCache, 15 * 60 * 1000);
}
