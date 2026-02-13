import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json({ message: 'Missing phone or password' }, { status: 400 });
        }

        const sanitizedPhone = phone.startsWith('0') ? phone.slice(1) : phone;
        const phoneInt = parseInt(sanitizedPhone, 10);

        if (isNaN(phoneInt)) {
            return NextResponse.json({ message: 'Invalid phone format' }, { status: 400 });
        }

        const seller = await prisma.seller_details.findFirst({
            where: { tel1: phoneInt },
        });

        if (!seller || seller.password !== password) {
            return NextResponse.json({ message: 'Invalid phone number or password' }, { status: 401 });
        }

        // Create session token
        const token = randomUUID();
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Store session in DB
        const session = await prisma.seller_sessions.create({
            data: {
                seller_id: seller.id,
                token: token,
                token_expire_at: expiry,
                last_visit_page: '/seller',
            },
        });

        return NextResponse.json({ token, expiry, session });
    } catch (error: any) {
        console.error('API Error (Seller Login):', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
