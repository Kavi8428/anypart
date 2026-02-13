"use server"

import { getBuyerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getBuyerConversations() {
    try {
        const session = await getBuyerSession()
        if (!session) {
            return { error: "Not authenticated", notSignedIn: true }
        }

        const conversations = await prisma.conversations.findMany({
            where: {
                buyer_id: session.buyer_id, // Accessing buyer_id from session relations
            },
            include: {
                seller_details: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                        seller_types: true,
                    }
                },
                messages: {
                    orderBy: {
                        created_at: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updated_at: 'desc',
            },
        })

        // Transform data for UI
        const formattedConversations = conversations.map(conv => {
            const lastMsg = conv.messages[0]
            return {
                id: conv.id.toString(),
                partnerName: conv.seller_details.name,
                partnerAvatar: conv.seller_details.logo_url || "",
                partnerId: conv.seller_details.id,
                lastMessage: lastMsg ? lastMsg.content : "No messages yet",
                lastMessageTime: lastMsg ? lastMsg.created_at : conv.created_at,
                unreadCount: 0, // Logic for unread count needed if schema supports it
                online: false, // Online status not tracked in schema
            }
        })

        return { conversations: formattedConversations }

    } catch (error) {
        console.error("Error fetching conversations:", error)
        return { error: "Failed to fetch conversations" }
    }
}

export async function getConversationMessages(conversationId: string) {
    try {
        const session = await getBuyerSession()
        if (!session) {
            return { error: "Not authenticated" }
        }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        // Verify access
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.buyer_id !== session.buyer_id) {
            return { error: "Unauthorized" }
        }

        const messages = await prisma.messages.findMany({
            where: { conversation_id: convIdInt },
            orderBy: { created_at: 'asc' },
            include: {
                media: true
            }
        })

        // Format messages
        const formattedMessages = messages.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            senderId: msg.sender_id === session.buyer_id ? "me" : "partner", // Utilizing ID comparison assumption
            timestamp: msg.created_at,
            isRead: msg.is_read === 1,
            media: msg.media
        }))

        return { messages: formattedMessages }

    } catch (error) {
        console.error("Error fetching messages:", error)
        return { error: "Failed to fetch messages" }
    }
}
