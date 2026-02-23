'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function adminLogin(prevState: unknown, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { message: 'Username and password are required' };
    }

    try {
        const admin = await prisma.app_admins.findUnique({
            where: { user_name: username },
        });

        if (!admin || !admin.password) {
            return { message: 'Invalid credentials' };
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return { message: 'Invalid credentials' };
        }

        // Create session
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        await prisma.app_admin_sessions.create({
            data: {
                admin_id: admin.id,
                token: token,
                token_expire_at: expiresAt,
                last_visit_page: '/admin',
            },
        });

        const cookieStore = await cookies();
        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });

        return { message: 'success: Logged in successfully' };
    } catch (error) {
        console.error('Admin login error:', error);
        return { message: 'An error occurred during login' };
    }
}

export async function adminLogout() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (token) {
        try {
            await prisma.app_admin_sessions.deleteMany({
                where: { token: token },
            });
        } catch (error) {
            console.error('Admin logout error:', error);
        }
    }

    cookieStore.delete('admin_session');
}
