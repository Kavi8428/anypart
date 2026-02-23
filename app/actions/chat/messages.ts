"use server"

import { getBuyerSession, getSellerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─── Helper: fetch message and verify ownership ───────────────────────────────
async function getMessageAndOwner(messageId: number) {
    return prisma.messages.findUnique({
        where: { id: messageId },
        include: { conversations: true },
    })
}

// ─── Edit Message ─────────────────────────────────────────────────────────────
export async function editMessage(
    messageId: string,
    newContent: string,
    role: "buyer" | "seller",
) {
    try {
        const idInt = parseInt(messageId)
        if (isNaN(idInt)) return { error: "Invalid message ID" }

        if (!newContent.trim()) return { error: "Content cannot be empty" }
        if (newContent.length > 2000) return { error: "Message too long" }

        const message = await getMessageAndOwner(idInt)
        if (!message) return { error: "Message not found" }

        if (message.is_deleted === 1) return { error: "Cannot edit a deleted message" }

        // Verify ownership
        if (role === "buyer") {
            const session = await getBuyerSession()
            if (!session) return { error: "Not authenticated" }
            if (message.sender_type !== 0 || message.sender_id !== session.buyer_id)
                return { error: "Unauthorized" }
        } else {
            const session = await getSellerSession()
            if (!session) return { error: "Not authenticated" }
            if (message.sender_type !== 1 || message.sender_id !== session.seller_id)
                return { error: "Unauthorized" }
        }

        const updated = await prisma.messages.update({
            where: { id: idInt },
            data: {
                content: newContent.trim(),
                is_edited: 1,
                edited_at: new Date(),
            },
        })

        return {
            success: true,
            message: {
                id: updated.id.toString(),
                content: updated.content,
                isEdited: true,
                isDeleted: false,
            },
        }
    } catch (error) {
        console.error("Error editing message:", error)
        return { error: "Failed to edit message" }
    }
}

// ─── Delete Message (soft delete) ─────────────────────────────────────────────
export async function deleteMessage(
    messageId: string,
    role: "buyer" | "seller",
) {
    try {
        const idInt = parseInt(messageId)
        if (isNaN(idInt)) return { error: "Invalid message ID" }

        const message = await getMessageAndOwner(idInt)
        if (!message) return { error: "Message not found" }

        // Verify ownership
        if (role === "buyer") {
            const session = await getBuyerSession()
            if (!session) return { error: "Not authenticated" }
            if (message.sender_type !== 0 || message.sender_id !== session.buyer_id)
                return { error: "Unauthorized" }
        } else {
            const session = await getSellerSession()
            if (!session) return { error: "Not authenticated" }
            if (message.sender_type !== 1 || message.sender_id !== session.seller_id)
                return { error: "Unauthorized" }
        }

        await prisma.messages.update({
            where: { id: idInt },
            data: {
                is_deleted: 1,
                content: "",       // wipe content
            },
        })

        return { success: true, messageId: messageId }
    } catch (error) {
        console.error("Error deleting message:", error)
        return { error: "Failed to delete message" }
    }
}
