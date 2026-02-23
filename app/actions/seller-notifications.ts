"use server"

import { prisma } from "@/lib/prisma"
import { getSellerSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type NotificationItem = {
    id: string
    dbId: number
    type: "message" | "order"
    title: string
    description: string
    timestamp: Date
    link: string
    isRead: boolean
}

export async function getSellerNotifications(): Promise<NotificationItem[]> {
    try {
        const session = await getSellerSession()
        if (!session) return []

        const sellerId = session.seller_id

        // 1. Get new orders
        const newOrders = await prisma.orders.findMany({
            where: {
                seller_products: {
                    seller_id: sellerId
                },
                is_viewed: 0
            },
            include: {
                seller_products: {
                    include: {
                        p_name_ref: true
                    }
                },
                buyer_details: true
            },
            orderBy: { created_at: 'desc' }
        })

        // 2. Get unread messages
        const unreadMessages = await prisma.messages.findMany({
            where: {
                receiver_id: sellerId,
                sender_type: 0, // buyer
                is_read: 0,
                is_deleted: 0
            },
            include: {
                conversations: {
                    include: {
                        buyer_details: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        })

        const notifications: NotificationItem[] = []

        newOrders.forEach(order => {
            notifications.push({
                id: `order-${order.id}`,
                dbId: order.id,
                type: "order",
                title: "New Order Received!",
                description: `${order.buyer_details?.full_name || "A buyer"} ordered ${order.seller_products?.p_name_ref?.name || "a product"}`,
                timestamp: order.created_at,
                // Redirects to orders page
                link: `/seller/orders`,
                isRead: false
            })
        })

        unreadMessages.forEach(m => {
            const msg = m as unknown as {
                id: number,
                content: string,
                created_at: Date,
                conversations: {
                    buyer_details: { full_name: string | null }
                }
            };
            notifications.push({
                id: `msg-${msg.id}`,
                dbId: msg.id,
                type: "message",
                title: `Message from ${msg.conversations?.buyer_details?.full_name || "Buyer"}`,
                description: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
                timestamp: msg.created_at,
                // Assuming seller chats passes conversation via URL or we just go to chats
                link: `/seller/chats`,
                isRead: false
            })
        })

        // Sort combined notifications by descending date
        return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return []
    }
}

export async function markOrderAsViewed(orderId: number) {
    const session = await getSellerSession()
    if (!session) return { success: false }

    try {
        await prisma.orders.update({
            where: { id: orderId },
            data: { is_viewed: 1 }
        })
        revalidatePath("/seller")
        return { success: true }
    } catch {
        return { success: false }
    }
}
