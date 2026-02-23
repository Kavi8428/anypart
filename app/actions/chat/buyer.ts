"use server"

import { getBuyerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveFile, getMimeTypeId, MAX_FILE_SIZE } from "@/lib/file-server"

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
                        tel1: true,
                        tel2: true,
                        address: true,
                        cities: { select: { name: true } },
                        districts: { select: { name: true } },
                        seller_types: { select: { type: true } },
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
                unreadCount: 0,
                online: false,
                partnerPhone: conv.seller_details.tel1 || conv.seller_details.tel2 || undefined,
                partnerDetails: {
                    address: conv.seller_details.address || undefined,
                    city: conv.seller_details.cities?.name || undefined,
                    district: conv.seller_details.districts?.name || undefined,
                    sellerType: conv.seller_details.seller_types?.type || undefined,
                    tel2: conv.seller_details.tel2 || undefined,
                }
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
            content: msg.is_deleted === 1 ? "" : msg.content,
            senderRole: msg.sender_type === 0 ? "buyer" : "seller",
            isMe: msg.sender_type === 0,
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

export async function sendBuyerMessage(conversationId: string, content: string, mediaFile?: File) {
    try {
        const session = await getBuyerSession()
        if (!session) {
            return { error: "Not authenticated" }
        }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        if (!content.trim() && !mediaFile) return { error: "Message content or media cannot be empty" }
        if (content.length > 2000) return { error: "Message too long" }

        // Verify access & get seller_id
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.buyer_id !== session.buyer_id) {
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
                sender_id: session.buyer_id,
                receiver_id: conversation.seller_id,
                sender_type: 0, // 0 = Buyer
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
                senderRole: "buyer" as const,
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

export async function markBuyerMessagesRead(conversationId: string) {
    try {
        const session = await getBuyerSession()
        if (!session) return { error: "Not authenticated" }

        const convIdInt = parseInt(conversationId)
        if (isNaN(convIdInt)) return { error: "Invalid ID" }

        // Verify access
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation || conversation.buyer_id !== session.buyer_id) {
            return { error: "Unauthorized" }
        }

        // Update unread messages sent by seller (sender_type = 1)
        await prisma.messages.updateMany({
            where: {
                conversation_id: convIdInt,
                sender_type: 1, // Sent by seller
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
