'use server';

import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import crypto from 'crypto';

export async function generatePayHereParams(amount: number) {
    const session = await getSellerSession();
    if (!session) throw new Error('Unauthorized');

    // Fetch seller details for PayHere fields
    const seller = await prisma.seller_details.findUnique({
        where: { id: session.seller_id },
    });

    if (!seller) throw new Error('Seller not found');

    let merchant_id = process.env.PAYHERE_MERCHANT_ID;
    let merchant_secret = process.env.PAYHERE_SECRET;

    if (!merchant_id || !merchant_secret) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('PayHere credentials not found. Using mock credentials for development.');
            merchant_id = "TEST_MERCHANT_ID";
            merchant_secret = "TEST_SECRET";
        } else {
            throw new Error('PayHere credentials not configured');
        }
    }

    const order_id = `PAY_${Date.now()}`;
    const currency = 'LKR';

    // MD5 Hash calculation: merchant_id + order_id + amount + currency + md5_secret
    // const hash = md5(merchant_id + order_id + amount + currency + md5_secret).toUpperCase();
    const hashStr = merchant_id + order_id + amount.toFixed(2).replaceAll(',', '') + currency + crypto.createHash('md5').update(merchant_secret).digest("hex").toUpperCase();
    const hash = crypto.createHash('md5').update(hashStr).digest("hex").toUpperCase();

    const pendingStatus = await prisma.payment_status.findFirst({
        where: { status: 'Pending' }
    });

    // Save pending payment record
    await prisma.seller_payments.create({
        data: {
            seller_id: session.seller_id,
            order_id: order_id,
            amount: amount,
            currency: currency,
            status_id: pendingStatus?.id || 1, // Fallback to 1 if not found
        }
    });

    return {
        sandbox: process.env.NODE_ENV !== 'production',
        merchant_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/products`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/products`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/notify`,
        order_id,
        items: 'Featured Product Ad',
        amount: amount.toFixed(2),
        currency,
        first_name: seller.name,
        last_name: '',
        email: seller.user_name.includes('@') ? seller.user_name : 'seller@anypart.lk',
        phone: seller.tel1.toString(),
        address: seller.address,
        city: 'Colombo', // Should ideally come from city name lookup
        country: 'Sri Lanka',
        hash
    };
}

export async function checkPaymentStatus(order_id: string) {
    const payment = await prisma.seller_payments.findFirst({
        where: { order_id },
        include: { status_ref: true }
    });
    return payment?.status_ref?.status === 'Completed';
}

export async function mockPaymentSuccess(order_id: string) {
    const session = await getSellerSession();
    if (!session) throw new Error('Unauthorized');

    if (process.env.NODE_ENV === 'production') {
        throw new Error('Mock payments disabled in production');
    }

    const successStatus = await prisma.payment_status.findFirst({
        where: { status: 'Completed' }
    });

    const mockMethod = await prisma.payment_methods.findFirst({
        where: { method: 'MOCK_TESTING' }
    });

    // Create mock method if not exists for dev
    let methodId = mockMethod?.id;
    if (!methodId && process.env.NODE_ENV === 'development') {
        const newMethod = await prisma.payment_methods.create({
            data: { method: 'MOCK_TESTING' }
        });
        methodId = newMethod.id;
    }

    await prisma.seller_payments.updateMany({
        where: { order_id: order_id },
        data: {
            status_id: successStatus?.id || 2, // Fallback to 2 (Success)
            method_id: methodId,
            payhere_amount: 5000,
            payhere_status: 2
        }
    });

    return { success: true };
}
