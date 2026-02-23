
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBuyerSession, getSellerSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const conversationId = searchParams.get('conversationId')
        const lastMessageId = searchParams.get('lastMessageId')
        const role = searchParams.get('role') // 'buyer' or 'seller'

        if (!conversationId || !role) {
            return NextResponse.json({ error: "Missing required params" }, { status: 400 })
        }

        const convIdInt = parseInt(conversationId)
        const lastIdInt = lastMessageId ? parseInt(lastMessageId) : 0

        // Authenticate based on role
        let sessionUserId: number | undefined

        if (role === 'buyer') {
            const session = await getBuyerSession()
            if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            sessionUserId = session.buyer_id
        } else if (role === 'seller') {
            const session = await getSellerSession()
            if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            sessionUserId = session.seller_id
        } else {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        // Verify conversation ownership
        const conversation = await prisma.conversations.findUnique({
            where: { id: convIdInt },
        })

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
        }

        // Strict ownership check
        if (role === 'buyer' && conversation.buyer_id !== sessionUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        if (role === 'seller' && conversation.seller_id !== sessionUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Fetch new messages
        const newMessages = await prisma.messages.findMany({
            where: {
                conversation_id: convIdInt,
                id: { gt: lastIdInt }
            },
            orderBy: { created_at: 'asc' },
            include: { media: true }
        })

        // Check if there are unread messages to update read status (optional side-effect)
        // We actually rely on explicit markRead actions, but we can verify unread counts here if needed.

        const formattedMessages = newMessages.map(msg => ({
            id: msg.id.toString(),
            content: msg.is_deleted === 1 ? "" : msg.content,
            senderRole: msg.sender_type === 1 ? "seller" : "buyer",
            isMe: role === 'buyer' ? msg.sender_type === 0 : msg.sender_type === 1,
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

        return NextResponse.json({
            messages: formattedMessages,
            hasNew: newMessages.length > 0
        })

    } catch (error) {
        console.error("Chat polling error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
