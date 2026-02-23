
"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChatMessage } from "./types"
import { MessageBubble } from "./MessageBubble"
import clsx from "clsx"

type MessageListProps = {
    messages: ChatMessage[]
    isLoadingMessages: boolean
    className?: string
    onEditMessage?: (messageId: string, newContent: string) => Promise<void>
    onDeleteMessage?: (messageId: string) => Promise<void>
}

export function MessageList({ messages, isLoadingMessages, className, onEditMessage, onDeleteMessage }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastMessageCount = useRef(messages.length)

    // Smart scroll to bottom
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const isNewMessage = messages.length > lastMessageCount.current
        const lastMsg = messages[messages.length - 1]

        // If it's a new message
        if (isNewMessage) {
            const { scrollTop, scrollHeight, clientHeight } = container
            // Check if user is near bottom (within 100px) or if it's their own message
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
            const isMe = lastMsg?.isMe

            if (isNearBottom || isMe) {
                // Use a small timeout to ensure DOM is updated
                setTimeout(() => {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: "smooth"
                    })
                }, 50)
            }
        } else if (lastMessageCount.current === 0 && messages.length > 0) {
            // Initial load - jump to bottom immediately
            container.scrollTop = container.scrollHeight
        }

        lastMessageCount.current = messages.length
    }, [messages])

    if (isLoadingMessages) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground w-full h-full">
                <span className="loading loading-spinner loading-md"></span>
                <span className="ml-2">Loading messages...</span>
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground w-full h-full">
                <div className="bg-muted rounded-full p-4 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 opacity-50"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                    </svg>
                </div>
                <p className="text-center">No messages yet.</p>
                <p className="text-sm opacity-70">Start the conversation!</p>
            </div>
        )
    }

    return (
        <div
            ref={scrollRef}
            className={clsx("flex-1 overflow-y-auto px-4 py-6 scroll-smooth h-full", className)}
        >
            <div className="space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const showDate =
                            index === 0 ||
                            new Date(msg.timestamp).toDateString() !==
                            new Date(messages[index - 1].timestamp).toDateString()

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="flex justify-center my-6 sticky top-2 z-10">
                                        <span className="text-[10px] sm:text-xs font-medium bg-muted/80 backdrop-blur-sm px-3 py-1 rounded-full text-muted-foreground shadow-sm border border-border/50">
                                            {new Date(msg.timestamp).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MessageBubble
                                        message={msg}
                                        onEdit={onEditMessage}
                                        onDelete={onDeleteMessage}
                                    />
                                </motion.div>
                            </div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}
