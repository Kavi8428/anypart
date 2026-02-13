import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const merchant_id = formData.get('merchant_id') as string;
        const order_id = formData.get('order_id') as string;
        const payhere_amount = formData.get('payhere_amount') as string;
        const payhere_currency = formData.get('payhere_currency') as string;
        const status_code = formData.get('status_code') as string;
        const md5sig = formData.get('md5sig') as string;

        const merchant_secret = process.env.PAYHERE_SECRET || '4MjUzMTgzMTQyMjE4MTcyNDU1MjgxOTU2MTQwNDI2MTIzMDUwMjA=';
        const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();

        // Verify Hash: merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        const localHash = crypto.createHash('md5').update(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        ).digest('hex').toUpperCase();

        if (localHash !== md5sig) {
            return new NextResponse('Invalid hash', { status: 400 });
        }

        if (status_code === '2') { // 2 = Success
            await prisma.seller_payments.updateMany({
                where: { order_id: order_id },
                data: {
                    status: 'SUCCESS',
                    payhere_status: parseInt(status_code),
                    payhere_amount: parseFloat(payhere_amount),
                    method: formData.get('method') as string,
                }
            });
        } else if (status_code === '-2') { // -2 = Failed
            await prisma.seller_payments.updateMany({
                where: { order_id: order_id },
                data: {
                    status: 'FAILED',
                    payhere_status: parseInt(status_code),
                }
            });
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('PayHere Notify Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
