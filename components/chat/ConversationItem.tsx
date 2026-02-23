
"use client"

import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { ChatConversation, SenderRole } from "./types"
import clsx from "clsx"

type ConversationItemProps = {
    conversation: ChatConversation
    isSelected: boolean
    onClick: () => void
    role: SenderRole
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
    const { partnerName, partnerAvatar, lastMessage, lastMessageTime, unreadCount, orderRef, online } = conversation

    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex w-full items-center gap-3 p-3 transition-colors hover:bg-accent/50 cursor-pointer rounded-lg mb-1",
                isSelected && "bg-accent text-accent-foreground"
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                    {partnerAvatar ? (
                        <Image src={partnerAvatar} alt={partnerName} fill className="object-cover" unoptimized />
                    ) : (
                        <span className="font-semibold text-lg text-muted-foreground">
                            {partnerName?.charAt(0)?.toUpperCase()}
                        </span>
                    )}
                </div>
                {online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium truncate text-sm">{partnerName}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {lastMessageTime && formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })}
                    </span>
                </div>

                {/* Order Reference + Last Message */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        {orderRef && (
                            <span className="text-[10px] font-medium text-primary mb-0.5 truncate bg-primary/10 px-1.5 py-0.5 rounded-sm w-fit">
                                {orderRef}
                            </span>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{lastMessage}</p>
                    </div>

                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground shadow-sm">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
