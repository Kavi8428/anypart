import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const session = await getSellerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    try {
        const order = await prisma.orders.findFirst({
            where: {
                id: orderId,
                seller_products: {
                    seller_id: session.seller_id
                }
            },
            include: {
                buyer_details: {
                    include: {
                        cities: true,
                        districts: true
                    }
                },
                seller_products: {
                    include: {
                        p_name_ref: true,
                        v_model_ref: {
                            include: {
                                v_brands: true
                            }
                        },
                        v_year_ref: true,
                        condition_ref: true
                    }
                },
                order_tracking: {
                    include: {
                        order_status: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                },
                buyer_order_token: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('API Error fetching order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const session = await getSellerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const { status_id } = await request.json();

    if (!status_id) {
        return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    try {
        // Verify order belongs to seller
        const order = await prisma.orders.findFirst({
            where: {
                id: orderId,
                seller_products: {
                    seller_id: session.seller_id
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        // Add new tracking entry
        const tracking = await prisma.order_tracking.create({
            data: {
                order_id: orderId,
                status: status_id
            },
            include: {
                order_status: true
            }
        });

        return NextResponse.json(tracking);
    } catch (error) {
        console.error('API Error updating order status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
