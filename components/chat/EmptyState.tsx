
"use client"

import { MessageSquareText } from "lucide-react"
import { SenderRole } from "./types"

type EmptyStateProps = {
    role: SenderRole
}

export function EmptyState({ role }: EmptyStateProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/5 w-full h-full animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MessageSquareText className="h-10 w-10 text-primary opacity-80" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
                {role === "buyer" ? "Your Messages" : "Buyer Inquiries"}
            </h3>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
                {role === "buyer"
                    ? "Select a conversation from the list to start chatting with sellers about your orders or parts."
                    : "Select a conversation to respond to buyer questions and negotiate sales."}
            </p>
        </div>
    )
}
