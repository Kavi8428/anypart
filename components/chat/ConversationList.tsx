
"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { ConversationItem } from "./ConversationItem"
import { ChatConversation, SenderRole } from "./types"

type ConversationListProps = {
    conversations: ChatConversation[]
    selectedId: string | null
    isLoading: boolean
    onSelect: (id: string) => void
    role: SenderRole
}

export function ConversationList({ conversations, selectedId, isLoading, onSelect, role }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredConversations = conversations.filter(conv =>
        conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.orderRef?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const emptyState = (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground w-full h-full">
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
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                </svg>
            </div>
            <p className="text-center font-medium">No messages</p>
            <p className="text-sm opacity-70">
                You haven&apos;t started any conversations yet.
            </p>
        </div>
    )

    return (
        <div className="flex flex-col h-full bg-background/50 border-r w-full md:w-80 lg:w-96 flex-shrink-0">
            {/* Search Header */}
            <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <div className="animate-pulse bg-muted h-10 w-full rounded-md mb-2" />
                        <div className="animate-pulse bg-muted h-10 w-full rounded-md mb-2" />
                        <div className="animate-pulse bg-muted h-10 w-full rounded-md mb-2" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    emptyState
                ) : (
                    <div className="space-y-1">
                        {filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                role={role}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onClick={() => onSelect(conv.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
