import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Admin Route Protection
    if (pathname.startsWith('/admin')) {
        // Exclude public admin routes like login
        if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/api')) {
            const adminSession = request.cookies.get('admin_session');
            if (!adminSession) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        }
    }

    // 2. Seller Route Protection
    if (pathname.startsWith('/seller')) {
        // Exclude public seller routes (login, verify, etc.)
        if (!pathname.startsWith('/seller/login') && !pathname.startsWith('/seller/register') && !pathname.startsWith('/seller/api')) {
            const sellerSession = request.cookies.get('seller_session');
            if (!sellerSession) {
                return NextResponse.redirect(new URL('/seller/login', request.url));
            }
        }
    }

    // 3. Buyer Route Protection
    // Note: Buyers might be allowed to browse some pages without login, so we only protect specific paths
    // Adjust this list based on what pages require login
    const protectedBuyerRoutes = ['/buyer/dashboard', '/buyer/profile', '/buyer/orders'];
    if (protectedBuyerRoutes.some(route => pathname.startsWith(route))) {
        const buyerSession = request.cookies.get('buyer_session');
        if (!buyerSession) {
            return NextResponse.redirect(new URL('/buyer/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
