
"use client"

import { useState } from "react"
import { ChatShellProps } from "./types"
import { ConversationList } from "./ConversationList"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { EmptyState } from "./EmptyState"
import clsx from "clsx"

export function ChatShell({
    role,
    conversations,
    isLoadingConversations,
    selectedConversationId,
    messages,
    isLoadingMessages,
    onSelectConversation,
    onSendMessage,
    onEditMessage,
    onDeleteMessage,
    isSending
}: ChatShellProps) {
    const [mobileShowChat, setMobileShowChat] = useState(false)

    const selectedConversation = conversations.find(c => c.id === selectedConversationId)

    const handleSelect = (id: string) => {
        onSelectConversation(id)
        setMobileShowChat(true)
    }

    const handleBack = () => {
        setMobileShowChat(false)
    }

    return (
        <div className="flex bg-background h-[calc(100vh-140px)] rounded-xl border shadow-sm overflow-hidden">
            {/* Sidebar - Conversation List */}
            <div
                className={clsx(
                    "w-full md:w-80 lg:w-96 flex-col border-r bg-muted/10 relative z-10 transition-transform md:translate-x-0 h-full",
                    mobileShowChat ? "hidden md:flex" : "flex"
                )}
            >
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId}
                    isLoading={isLoadingConversations}
                    onSelect={handleSelect}
                    role={role}
                />
            </div>

            {/* Main Chat Area */}
            <div
                className={clsx(
                    "flex-1 flex flex-col bg-background relative h-full transition-opacity duration-300",
                    !mobileShowChat ? "hidden md:flex" : "flex w-full absolute inset-0 md:relative md:w-auto"
                )}
            >
                {selectedConversation ? (
                    <>
                        <ChatHeader
                            role={role}
                            conversation={selectedConversation}
                            onBack={handleBack}
                        />

                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            <MessageList
                                messages={messages}
                                isLoadingMessages={isLoadingMessages}
                                onEditMessage={onEditMessage}
                                onDeleteMessage={onDeleteMessage}
                            />
                        </div>

                        <MessageInput
                            onSendMessage={(content, media) => onSendMessage(content, media)}
                            isSending={isSending}
                        />
                    </>
                ) : (
                    <div className="flex-1 relative">
                        <EmptyState role={role} />
                    </div>
                )}
            </div>
        </div>
    )
}
