
"use server"

import { getSellerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveFile, getMimeTypeId, MAX_FILE_SIZE } from "@/lib/file-server"

export async function getSellerConversations() {
    try {
        const session = await getSellerSession()
        if (!session) {
            return { error: "Not authenticated", notSignedIn: true }
        }

        const conversations = await prisma.conversations.findMany({
            where: {
                seller_id: session.seller_id,
            },
            include: {
                buyer_details: {
                    select: {
                        id: true,
                        full_name: true,
                        tel: true,
                        address: true,
                        cities: { select: { name: true } },
                        districts: { select: { name: true } },
                    }
                },
                orders: {
                    select: {
                        id: true,
                        product_id: true,
                        seller_products: {
                            select: {
                                p_name_ref: { select: { name: true } },
                                v_model_ref: { select: { name: true } }
                            }
                        }
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
        const formattedConversations = await Promise.all(conversations.map(async (conv) => {
            const lastMsg = conv.messages[0]

            // Count unread messages from buyer (sender_type = 0)
            const unreadCount = await prisma.messages.count({
                where: {
                    conversation_id: conv.id,
                    sender_type: 0,
                    is_read: 0
                }
            })

            // Construct order reference name "Part Name for Car Model"
            const orderRef = conv.orders?.seller_products
                ? `${conv.orders.seller_products.p_name_ref.name} for ${conv.orders.seller_products.v_model_ref.name}`
                : `Order #${conv.order_id}`

            return {
                id: conv.id.toString(),
                partnerName: conv.buyer_details.full_name,
                partnerAvatar: null, // Buyers don't have avatars in schema yet
                partnerId: conv.buyer_details.id,
                orderId: conv.order_id,
                orderRef: orderRef,
                lastMessage: lastMsg ? lastMsg.content : "No messages yet",
                lastMessageTime: lastMsg ? lastMsg.created_at : conv.created_at,
                unreadCount: unreadCount,
                online: false,
                partnerPhone: conv.buyer_details.tel || undefined,
                partnerDetails: {
                    address: conv.buyer_details.address || undefined,
                    city: conv.buyer_details.cities?.name || undefined,
                    district: conv.buyer_details.districts?.name || undefined,
                }
            }
        }))

        return { conversations: formattedConversations }

    } catch (error) {
        console.error("Error fetching seller conversations:", error)
        return { error: "Failed to fetch conversations" }
    }
}

export async function getSellerConversationMessages(conversationId: string) {
    try {
        const session = await getSellerSession()
        if (!session) {
            return { error: "Not authenticated" }
        }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        // Verify access
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.seller_id !== session.seller_id) {
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
            content: msg.is_deleted === 1 ? "" : msg.content,
            senderRole: msg.sender_type === 1 ? "seller" : "buyer" as const,
            isMe: msg.sender_type === 1,
            timestamp: msg.created_at,
            isRead: msg.is_read === 1,
            isEdited: msg.is_edited === 1,
            isDeleted: msg.is_deleted === 1,
            media: msg.media.map(m => ({
                id: m.id,
                url: m.url,
                type: m.type,
                fileName: m.file_name,
                fileSize: m.file_size
            }))
        }))

        return { messages: formattedMessages }

    } catch (error) {
        console.error("Error fetching messages:", error)
        return { error: "Failed to fetch messages" }
    }
}

export async function sendSellerMessage(conversationId: string, content: string, mediaFile?: File) {
    try {
        const session = await getSellerSession()
        if (!session) {
            return { error: "Not authenticated" }
        }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        if (!content.trim() && !mediaFile) return { error: "Message content or media cannot be empty" }
        if (content.length > 2000) return { error: "Message too long" }

        // Verify access & get buyer_id
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.seller_id !== session.seller_id) {
            return { error: "Unauthorized" }
        }

        // Handle Media Upload if any
        interface MediaData {
            url: string
            file_name: string
            file_size: number
            type: number
        }
        let mediaData: MediaData | null = null
        if (mediaFile) {
            if (mediaFile.size > MAX_FILE_SIZE) {
                return { error: "File is too large. Maximum size is 100 MB." }
            }
            const fileName = await saveFile(mediaFile, "chat")
            if (fileName) {
                mediaData = {
                    url: `/chat/${fileName}`,
                    file_name: mediaFile.name,
                    file_size: mediaFile.size,
                    type: getMimeTypeId(mediaFile.type),
                }
            }
        }

        // Create message
        const newMessage = await prisma.messages.create({
            data: {
                conversation_id: convIdInt,
                sender_id: session.seller_id,
                receiver_id: conversation.buyer_id,
                sender_type: 1, // 1 = Seller
                content: content.trim() || "",
                is_read: 0,
                media: mediaData ? {
                    create: mediaData
                } : undefined
            },
            include: {
                media: true
            }
        })

        // Update conversation timestamp
        await prisma.conversations.update({
            where: { id: convIdInt },
            data: { updated_at: new Date() }
        })

        return {
            message: {
                id: newMessage.id.toString(),
                content: newMessage.content,
                senderRole: "seller" as const,
                isMe: true,
                timestamp: newMessage.created_at,
                isRead: false,
                isEdited: false,
                isDeleted: false,
                media: newMessage.media.map(m => ({
                    id: m.id,
                    url: m.url,
                    type: m.type,
                    fileName: m.file_name,
                    fileSize: m.file_size
                }))
            }
        }

    } catch (error) {
        console.error("Error sending message:", error)
        return { error: "Failed to send message" }
    }
}

export async function markSellerMessagesRead(conversationId: string) {
    try {
        const session = await getSellerSession()
        if (!session) return { error: "Not authenticated" }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        // Verify access
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.seller_id !== session.seller_id) {
            return { error: "Unauthorized" }
        }

        // Update unread messages sent by buyer (sender_type = 0)
        await prisma.messages.updateMany({
            where: {
                conversation_id: convIdInt,
                sender_type: 0, // Sent by buyer
                is_read: 0
            },
            data: { is_read: 1 }
        })

        return { success: true }
    } catch (error) {
        console.error("Error marking messages read:", error)
        return { error: "Failed to update status" }
    }
}
