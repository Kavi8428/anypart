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

        const merchant_secret = process.env.PAYHERE_SECRET;
        if (!merchant_secret) {
            console.error('PAYHERE_SECRET not configured');
            return new NextResponse('Configuration error', { status: 500 });
        }

        const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();

        // Verify Hash: merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        const localHash = crypto.createHash('md5').update(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        ).digest('hex').toUpperCase();

        if (localHash !== md5sig) {
            console.warn('Invalid PayHere hash received for order:', order_id);
            return new NextResponse('Invalid hash', { status: 400 });
        }

        // Find existing payment
        const payment = await prisma.seller_payments.findFirst({
            where: { order_id: order_id }
        });

        if (!payment) {
            console.error('Payment record not found for order:', order_id);
            return new NextResponse('Not Found', { status: 404 });
        }

        // Idempotency: skip if already success (ID 2 = Completed)
        if (payment.status_id === 2) {
            return new NextResponse('OK', { status: 200 });
        }

        if (status_code === '2') { // 2 = Success from PayHere
            const method = formData.get('method') as string;
            // Best effort to find or create payment method
            let methodId = null;
            if (method) {
                const methodRef = await prisma.payment_methods.findFirst({
                    where: { method }
                });
                if (methodRef) {
                    methodId = methodRef.id;
                } else {
                    const newMethod = await prisma.payment_methods.create({
                        data: { method }
                    });
                    methodId = newMethod.id;
                }
            }

            await prisma.$transaction([
                prisma.seller_payments.update({
                    where: { id: payment.id },
                    data: {
                        status_id: 2, // 2 = Completed
                        payhere_status: parseInt(status_code),
                        payhere_amount: parseFloat(payhere_amount),
                        method_id: methodId,
                    }
                }),
                prisma.seller_products.updateMany({
                    where: { payment_id: payment.id },
                    data: { is_featured: 1 }
                })
            ]);
        } else if (status_code === '-2') { // -2 = Failed from PayHere
            await prisma.seller_payments.update({
                where: { id: payment.id },
                data: {
                    status_id: 3, // 3 = Failed
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
