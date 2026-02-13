"use client"

import * as React from "react"
import { Send, Phone, Video, Info, MoreVertical, Search, ArrowLeft, Paperclip, Image as ImageIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { BuyerSignInDialog } from "@/components/buyer/auth/BuyerSignInDialog"
// Import server actions
import { getBuyerConversations, getConversationMessages } from "@/app/actions/chat/buyer"

// Types matching server action return
type Message = {
    id: string
    content: string
    senderId: "me" | "partner"
    timestamp: Date
    isRead: boolean
}

type Conversation = {
    id: string
    partnerName: string
    partnerAvatar: string
    partnerId: number
    lastMessage: string
    lastMessageTime: Date
    unreadCount: number
    online: boolean
}

export default function ChatPage() {
    const [conversations, setConversations] = React.useState<Conversation[]>([])
    const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])

    // UI states
    const [mobileShowChat, setMobileShowChat] = React.useState(false)
    const [messageInput, setMessageInput] = React.useState("")
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null) // null = loading
    const [isLoadingConversations, setIsLoadingConversations] = React.useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)

    // Load conversations on mount
    React.useEffect(() => {
        async function loadConversations() {
            try {
                const res = await getBuyerConversations()
                if (res.error) {
                    if (res.notSignedIn) {
                        setIsAuthenticated(false)
                    } else {
                        console.error(res.error)
                        // Could add toast error here
                    }
                } else if (res.conversations) {
                    setIsAuthenticated(true)
                    // Convert date strings back to Date objects if needed (server actions serialize dates)
                    const formatted = res.conversations.map((c: any) => ({
                        ...c,
                        lastMessageTime: new Date(c.lastMessageTime)
                    }))
                    setConversations(formatted)
                }
            } catch (err) {
                console.error("Failed to load conversations", err)
            } finally {
                setIsLoadingConversations(false)
            }
        }
        loadConversations()
    }, [])

    // Load messages when conversation is selected
    React.useEffect(() => {
        if (!selectedConversationId) return

        async function loadMessages() {
            setIsLoadingMessages(true)
            try {
                const res = await getConversationMessages(selectedConversationId!)
                if (res.messages) {
                    const formatted = res.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                    setMessages(formatted)
                }
            } catch (err) {
                console.error("Failed to load messages", err)
            } finally {
                setIsLoadingMessages(false)
            }
        }
        loadMessages()
    }, [selectedConversationId])

    const selectedConversation = conversations.find(c => c.id === selectedConversationId)

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id)
        setMobileShowChat(true)
    }

    const handleBackToRun = () => {
        setMobileShowChat(false)
        setSelectedConversationId(null)
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!messageInput.trim()) return
        // Sending logic utilizing server action would go here
        console.log("Sending:", messageInput)
        setMessageInput("")
    }

    // Loading State
    if (isAuthenticated === null || isLoadingConversations) {
        return (
            <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-lg border bg-background shadow-sm">
                <div className="flex flex-col items-center gap-2">
                    <span className="loading loading-spinner loading-md"></span>
                    <p className="text-muted-foreground">Loading chats...</p>
                </div>
            </div>
        )
    }

    // Not Authenticated State
    if (isAuthenticated === false) {
        return (
            <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-lg border bg-background shadow-sm p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
                    <p className="text-muted-foreground mb-6">
                        You need to be signed in as a buyer to view your messages and chat with sellers.
                    </p>
                    <BuyerSignInDialog>
                        <Button>
                            Sign In / Register
                        </Button>
                    </BuyerSignInDialog>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-lg border bg-background shadow-sm">
            {/* Sidebar - Conversation List */}
            <div className={cn(
                "flex w-full flex-col border-r md:w-80 lg:w-96",
                mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                <div className="flex h-14 items-center border-b px-4 py-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search chats..." className="pl-8 h-9" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => handleSelectConversation(conversation.id)}
                                className={cn(
                                    "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                                    selectedConversationId === conversation.id && "bg-muted"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={conversation.partnerAvatar} alt={conversation.partnerName} />
                                        <AvatarFallback>{conversation.partnerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {conversation.online && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{conversation.partnerName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {conversation.lastMessage}
                                    </p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {conversation.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex flex-1 flex-col",
                !mobileShowChat ? "hidden md:flex" : "flex"
            )}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex h-14 items-center justify-between border-b px-4 py-2">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={handleBackToRun}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={selectedConversation.partnerAvatar} />
                                    <AvatarFallback>{selectedConversation.partnerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-sm font-medium">{selectedConversation.partnerName}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedConversation.online ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <span className="loading loading-spinner text-muted-foreground">Loading messages...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isMe = message.senderId === "me"
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "flex max-w-[75%] md:max-w-[60%] flex-col rounded-xl px-4 py-2 shadow-sm",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-background border rounded-tl-none"
                                                )}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <span className={cn(
                                                    "self-end text-[10px] mt-1 opacity-70",
                                                    isMe ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="border-t p-4 bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <div className="flex gap-1 mb-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
                                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                </div>
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 min-h-[40px]"
                                />
                                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/10">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Info className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Select a conversation from the list to start chatting with sellers about your orders or parts.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
