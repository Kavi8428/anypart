'use server';

import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { normalizePagination, paginatedResponse } from '@/lib/pagination';
import { APP_CONFIG } from '@/lib/config';

export async function getSellerOrders(page: number = 1, limit?: number) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { page: normalizedPage, limit: normalizedLimit, skip } = normalizePagination({
        page,
        limit: limit || APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
    });

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
                take: normalizedLimit
            }),
            prisma.orders.count({
                where: {
                    seller_products: {
                        seller_id: session.seller_id
                    }
                }
            })
        ]);

        return paginatedResponse(orders, normalizedPage, normalizedLimit, total);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        throw new Error('Failed to fetch orders');
    }
}

export async function getOrderDetails(orderId: number) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

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
            throw new Error('Order not found');
        }

        return order;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw new Error('Failed to fetch order details');
    }
}

export async function updateOrderStatus(orderId: number, statusId: number) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
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
            throw new Error('Order not found or unauthorized');
        }

        // Add new tracking entry
        await prisma.order_tracking.create({
            data: {
                order_id: orderId,
                status: statusId
            }
        });

        revalidatePath('/seller/orders');
        revalidatePath(`/seller/orders/${orderId}`);

        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
    }
}

export async function getOrderStatuses() {
    try {
        return await prisma.order_status.findMany({
            orderBy: {
                id: 'asc'
            }
        });
    } catch (error) {
        console.error('Error fetching order statuses:', error);
        throw new Error('Failed to fetch order statuses');
    }
}
