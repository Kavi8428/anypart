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
        console.warn('PayHere credentials not found. Using mock credentials for testing.');
        merchant_id = "TEST_MERCHANT_ID";
        merchant_secret = "TEST_SECRET";
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

    // MOCK_TESTING enabled in production for demo/testing
    const successStatus = await prisma.payment_status.findFirst({
        where: { status: 'Completed' }
    });

    const mockMethod = await prisma.payment_methods.findFirst({
        where: { method: 'MOCK_TESTING' }
    });

    // Create mock method if not exists for dev
    let methodId = mockMethod?.id;
    if (!methodId) {
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

export async function getSellerPayments(page: number = 1, limit: number = 10) {
    const session = await getSellerSession();
    if (!session) throw new Error('Unauthorized');

    const skip = (page - 1) * limit;

    try {
        const [payments, total] = await Promise.all([
            prisma.seller_payments.findMany({
                where: { seller_id: session.seller_id },
                include: {
                    status_ref: true,
                    method_ref: true,
                    seller_products: {
                        include: {
                            p_name_ref: true,
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            prisma.seller_payments.count({
                where: { seller_id: session.seller_id },
            })
        ]);

        const formattedPayments = payments.map(p => ({
            id: p.id,
            order_id: p.order_id,
            amount: p.amount,
            currency: p.currency,
            status: p.status_ref?.status || 'Unknown',
            method: p.method_ref?.method || 'N/A',
            created_at: p.created_at,
            payhere_status: p.payhere_status,
            payhere_amount: p.payhere_amount,
            updated_at: p.updated_at,
            products: p.seller_products.map(sp => ({
                id: sp.id,
                name: sp.p_name_ref.name,
                image: sp.image_url_1,
                price: sp.price,
                description: sp.description,
            }))
        }));

        return {
            data: formattedPayments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw new Error("Failed to fetch payments");
    }
}

