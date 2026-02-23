'use server';

import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';

export async function getSellerDashboardData() {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const sellerId = session.seller_id;

    try {
        const [
            totalProducts,
            activeOrders,
            unreadMessages,
            ratingStats,
            recentOrders,
            productSplit
        ] = await Promise.all([
            // 1. Total Products (non-deleted)
            prisma.seller_products.count({
                where: {
                    seller_id: sellerId,
                    deleted_at: null
                }
            }),
            // 2. Total Orders
            prisma.orders.count({
                where: {
                    seller_products: {
                        seller_id: sellerId
                    }
                }
            }),
            // 3. Unread Messages (from buyers)
            prisma.messages.count({
                where: {
                    receiver_id: sellerId,
                    sender_type: 0, // buyer
                    is_read: 0,
                    is_deleted: 0
                }
            }),
            // 4. Rating Stats
            prisma.user_ratings.aggregate({
                where: {
                    rated_id: sellerId,
                    rated_type: 1 // Seller
                },
                _avg: {
                    rating: true
                },
                _count: {
                    id: true
                }
            }),
            // 5. Recent Orders (Top 5)
            prisma.orders.findMany({
                where: {
                    seller_products: {
                        seller_id: sellerId
                    }
                },
                include: {
                    buyer_details: {
                        select: {
                            full_name: true
                        }
                    },
                    seller_products: {
                        include: {
                            p_name_ref: {
                                select: {
                                    name: true
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
                take: 5
            }),
            // 6. Product Split
            prisma.seller_products.groupBy({
                by: ['is_featured'],
                where: {
                    seller_id: sellerId,
                    deleted_at: null
                },
                _count: {
                    id: true
                }
            })
        ]);

        const featuredCount = productSplit.find(p => p.is_featured === 1)?._count.id || 0;
        const regularCount = productSplit.find(p => p.is_featured === 0)?._count.id || 0;

        return {
            stats: {
                totalProducts,
                activeOrders,
                unreadMessages,
                averageRating: ratingStats._avg.rating || 0,
                ratingCount: ratingStats._count.id || 0
            },
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                buyerName: order.buyer_details?.full_name || 'Unknown Buyer',
                productName: order.seller_products?.p_name_ref?.name || 'Unknown Product',
                status: order.order_tracking[0]?.order_status?.status || 'Pending',
                statusId: order.order_tracking[0]?.order_status?.id || 1,
                createdAt: order.created_at
            })),
            productSplit: {
                featured: featuredCount,
                regular: regularCount
            }
        };
    } catch (error) {
        console.error('Error fetching seller dashboard data:', error);
        throw new Error('Failed to fetch dashboard data');
    }
}
