
export type SenderRole = "buyer" | "seller"

export type ChatMessage = {
    id: string
    content: string
    senderRole: SenderRole
    isMe: boolean
    timestamp: Date
    isRead: boolean
    isEdited?: boolean
    isDeleted?: boolean
    media?: ChatMedia[]
}

export type ChatMedia = {
    id: number
    url: string
    type: number
    fileName: string
    fileSize: number
}

export type ChatConversation = {
    id: string
    partnerId: number
    partnerName: string
    partnerAvatar: string | null
    orderId: number
    orderRef?: string // Optional, e.g. "Order #123"
    lastMessage: string
    lastMessageTime: Date
    unreadCount: number
    online?: boolean // Optional
    partnerPhone?: string // Optional
    partnerDetails?: {
        address?: string
        city?: string
        district?: string
        sellerType?: string
        tel2?: string
    }
}

export type ChatShellProps = {
    role: SenderRole
    conversations: ChatConversation[]
    isLoadingConversations: boolean
    selectedConversationId: string | null
    messages: ChatMessage[]
    isLoadingMessages: boolean
    onSelectConversation: (id: string) => void
    onSendMessage: (content: string, media?: File) => Promise<void>
    onEditMessage: (messageId: string, newContent: string) => Promise<void>
    onDeleteMessage: (messageId: string) => Promise<void>
    isSending: boolean
}
