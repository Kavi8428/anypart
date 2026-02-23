/**
 * Normalizes image URLs to prevent double-pathing and handle external URLs
 * @param url The image URL or filename from the database
 * @param defaultPath The default prefix to use if it's just a filename (default: '/products/')
 * @returns The normalized URL string
 */
export function normalizeImageUrl(url: string | null | undefined, defaultPath: string = '/products/'): string {
    if (!url) return "/placeholder-product.png";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url; // Already has a leading slash
    return `${defaultPath}${url}`; // Just a filename
}
