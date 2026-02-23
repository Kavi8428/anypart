import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const session = await getSellerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    try {
        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where: {
                    seller_products: {
                        seller_id: session.seller_id
                    }
                },
                include: {
                    buyer_details: true,
                    seller_products: {
                        include: {
                            p_name_ref: true,
                            v_model_ref: {
                                include: {
                                    v_brands: true
                                }
                            }
                        }
                    },
                    order_tracking: {
                        include: {
                            order_status: true
                        },
                        orderBy: {
                            created_at: 'desc'
                        },
                        take: 1
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.orders.count({
                where: {
                    seller_products: {
                        seller_id: session.seller_id
                    }
                }
            })
        ]);

        return NextResponse.json({
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('API Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
