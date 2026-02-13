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

    const merchant_id = process.env.PAYHERE_MERCHANT_ID || '1211149'; // Default sample ID for dev
    const merchant_secret = process.env.PAYHERE_SECRET || '4MjUzMTgzMTQyMjE4MTcyNDU1MjgxOTU2MTQwNDI2MTIzMDUwMjA='; // Default sample secret
    const order_id = `PAY_${Date.now()}`;
    const currency = 'LKR';

    // MD5 Hash calculation: merchant_id + order_id + amount + currency + md5_secret
    const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const amountFormatted = amount.toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
    const hashStr = merchant_id + order_id + amountFormatted + currency + hashedSecret;
    const hash = crypto.createHash('md5').update(hashStr).digest('hex').toUpperCase();

    // Save pending payment record
    await prisma.seller_payments.create({
        data: {
            seller_id: session.seller_id,
            order_id: order_id,
            amount: amount,
            currency: currency,
            status: 'PENDING',
        }
    });

    return {
        sandbox: true, // Set to false for production
        merchant_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/products`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/products`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/notify`,
        order_id,
        items: 'Featured Product Ad',
        amount: amountFormatted,
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
    });
    return payment?.status === 'SUCCESS';
}

export async function mockPaymentSuccess(order_id: string) {
    const session = await getSellerSession();
    if (!session) throw new Error('Unauthorized');

    await prisma.seller_payments.updateMany({
        where: { order_id: order_id },
        data: {
            status: 'SUCCESS',
            method: 'MOCK_TESTING',
            payhere_amount: 5000,
            payhere_status: 2
        }
    });

    return { success: true };
}
