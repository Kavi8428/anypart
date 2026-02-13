import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const appDetails = await prisma.app_details.findFirst();
        return NextResponse.json(appDetails);
    } catch (error: any) {
        console.error('API Error (App Details):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
