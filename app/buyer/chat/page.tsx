
"use client"

import * as React from "react"
import { ChatShell } from "@/components/chat/ChatShell"
import { ChatConversation, ChatMessage } from "@/components/chat/types"
import { getBuyerConversations, getConversationMessages, sendBuyerMessage, markBuyerMessagesRead } from "@/app/actions/chat/buyer"
import { editMessage, deleteMessage } from "@/app/actions/chat/messages"
import { BuyerSignInDialog } from "@/components/buyer/auth/BuyerSignInDialog"
import { Button } from "@/components/ui/button"
import { MessageSquareText } from "lucide-react"

export default function BuyerChatPage() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null)
    const [conversations, setConversations] = React.useState<ChatConversation[]>([])
    const [messages, setMessages] = React.useState<ChatMessage[]>([])
    const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null)
    const [isLoadingConversations, setIsLoadingConversations] = React.useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)

    // Initial Load
    React.useEffect(() => {
        let isMounted = true

        async function init() {
            try {
                const res = await getBuyerConversations()
                if (!isMounted) return

                if (res.error) {
                    if (res.notSignedIn) {
                        setIsAuthenticated(false)
                    } else {
                        console.error(res.error)
                    }
                } else if (res.conversations) {
                    setIsAuthenticated(true)
                    // Map generic conversation to ChatConversation type if needed
                    // (Our action already returns compatible structure, just need Date conversion)
                    const formatted = res.conversations.map((c: { lastMessageTime: string | Date }) => ({
                        ...c,
                        lastMessageTime: new Date(c.lastMessageTime),
                    })) as ChatConversation[]

                    setConversations(formatted)
                }
            } catch (err) {
                console.error("Failed to load chats", err)
            } finally {
                if (isMounted) setIsLoadingConversations(false)
            }
        }

        init()
        return () => { isMounted = false }
    }, [])

    const messagesRef = React.useRef<ChatMessage[]>([])

    // Sync ref with state
    React.useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    // Load Messages & Poll
    React.useEffect(() => {
        if (!selectedConversationId) return

        let isMounted = true

        async function fetchInitialMessages() {
            setIsLoadingMessages(true)
            try {
                const res = await getConversationMessages(selectedConversationId!)
                if (!isMounted) return

                if (res.messages) {
                    const formatted = res.messages.map((m: { timestamp: string | Date }) => ({
                        ...m,
                        timestamp: new Date(m.timestamp),
                    })) as ChatMessage[]

                    setMessages(formatted)
                    markBuyerMessagesRead(selectedConversationId!)
                }
            } catch (err) {
                console.error("Failed to load messages", err)
            } finally {
                if (isMounted) setIsLoadingMessages(false)
            }
        }

        fetchInitialMessages()

        // Polling logic
        const pollInterval = setInterval(async () => {
            if (!isMounted || !selectedConversationId) return
            try {
                // Use ref to get the latest messages for the last ID
                const currentMessages = messagesRef.current
                const lastMsgId = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].id : 0

                const response = await fetch(`/api/chat?conversationId=${selectedConversationId}&lastMessageId=${lastMsgId}&role=buyer`)

                if (response.ok) {
                    const data = await response.json()
                    if (data.hasNew && data.messages.length > 0 && isMounted) {
                        const newMsgs = data.messages.map((m: { timestamp: string | Date }) => ({
                            ...m,
                            timestamp: new Date(m.timestamp)
                        }))

                        setMessages(prev => {
                            const existingIds = new Set(prev.map(p => p.id))
                            const uniqueNew = newMsgs.filter((m: { id: string | number }) => !existingIds.has(m.id.toString()))
                            if (uniqueNew.length === 0) return prev
                            return [...prev, ...uniqueNew]
                        })

                        markBuyerMessagesRead(selectedConversationId)
                    }
                }
            } catch {
                // Silent fail on poll
            }
        }, 4000)

        return () => {
            isMounted = false
            clearInterval(pollInterval)
        }
    }, [selectedConversationId])

    // Handle Send
    const handleSendMessage = async (content: string, media?: File) => {
        if (!selectedConversationId) return

        setIsSending(true)
        try {
            // Optimistic update could go here
            const res = await sendBuyerMessage(selectedConversationId, content, media)

            if (res.message) {
                const newMsg = {
                    ...res.message,
                    timestamp: new Date(res.message.timestamp)
                }
                setMessages(prev => [...prev, newMsg])

                // Update conversation list preview
                setConversations(prev => prev.map(c =>
                    c.id === selectedConversationId
                        ? { ...c, lastMessage: content, lastMessageTime: new Date() }
                        : c
                ).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()))
            }
        } catch {
            console.error("Failed to send")
        } finally {
            setIsSending(false)
        }
    }

    const handleEditMessage = async (messageId: string, newContent: string) => {
        // Optimistic update
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
        ))
        const res = await editMessage(messageId, newContent, "buyer")
        if (res.error) {
            console.error("Edit failed:", res.error)
            // Optionally revert - for now just log
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        // Optimistic update
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, content: "", isDeleted: true } : m
        ))
        const res = await deleteMessage(messageId, "buyer")
        if (res.error) {
            console.error("Delete failed:", res.error)
        }
    }

    if (isAuthenticated === false) {
        return (
            <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-lg border bg-background shadow-sm p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquareText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
                    <p className="text-muted-foreground mb-6">
                        You need to be signed in as a buyer to view your messages and chat with sellers.
                    </p>
                    <BuyerSignInDialog>
                        <Button>Sign In / Register</Button>
                    </BuyerSignInDialog>
                </div>
            </div>
        )
    }

    return (
        <ChatShell
            role="buyer"
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
            selectedConversationId={selectedConversationId}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onSelectConversation={setSelectedConversationId}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            isSending={isSending}
        />
    )
}
