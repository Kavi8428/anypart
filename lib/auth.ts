
import { cookies } from 'next/headers';
import { prisma } from './prisma';

// --- 1. Admin Authentication ---
export async function getAdminSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) return null;

    const session = await prisma.app_admin_sessions.findFirst({
        where: {
            token: sessionToken,
            token_expire_at: { gt: new Date() },
        },
        include: {
            app_admins: {
                include: {
                    app_admin_roles: true,
                    app_departments: true,
                },
            },
        },
    });

    return session;
}

// --- 2. Seller Authentication ---
export async function getSellerSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('seller_session')?.value;

    if (!sessionToken) {
        console.log('[AUTH] No seller_session cookie found');
        return null;
    }

    console.log('[AUTH] seller_session cookie found, querying DB...');

    try {
        const session = await prisma.seller_sessions.findFirst({
            where: {
                token: sessionToken,
                token_expire_at: { gt: new Date() },
            },
            include: {
                seller_details: {
                    include: {
                        seller_types: true,
                    },
                },
            },
        });

        if (!session) {
            console.log('[AUTH] No valid session found in DB (expired or token mismatch)');
        } else {
            console.log('[AUTH] Session found for seller_id:', session.seller_id);
        }

        return session;
    } catch (error) {
        console.error('[AUTH] Error querying seller session:', error);
        return null;
    }
}

// --- 3. Buyer Authentication ---
export async function getBuyerSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('buyer_session')?.value;

    if (!sessionToken) return null;

    const session = await prisma.buyer_sessions.findFirst({
        where: {
            token: sessionToken,
            token_expire_at: { gt: new Date() },
        },
        include: {
            buyer_details: true,
        },
    });

    return session;
}
