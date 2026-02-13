import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (token) {
            await prisma.seller_sessions.deleteMany({
                where: { token },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (Seller Logout):', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
