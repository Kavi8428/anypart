
"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, MoreHorizontal, Phone, User, Star, Flag } from "lucide-react"
import { ChatConversation } from "./types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDetailsDialog } from "./UserDetailsDialog"
import { RateUserDialog } from "./RateUserDialog"
import { ReportUserDialog } from "./ReportUserDialog"

type ChatHeaderProps = {
    role: "buyer" | "seller"
    conversation: ChatConversation
    onBack: () => void
}

export function ChatHeader({ role, conversation, onBack }: ChatHeaderProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [showRate, setShowRate] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const { partnerName, partnerAvatar, online, orderRef, partnerId } = conversation

    const targetRole = role === "buyer" ? "seller" : "buyer"

    return (
        <div className="flex h-16 items-center border-b px-4 gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 justify-between shrink-0">
            {/* Left Group */}
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Mobile Back Button */}
                <button
                    onClick={onBack}
                    className="md:hidden -ml-2 p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

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

                {/* Name & Status */}
                <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold truncate">{partnerName}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        {online ? <span className="text-green-600 font-medium">Online</span> : <span>Offline</span>}
                        {orderRef && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="font-medium text-primary bg-primary/10 px-1.5 rounded-sm truncate max-w-[120px]">
                                    {orderRef}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Actions (Optional) */}
            <div className="flex items-center gap-1 shrink-0">
                {conversation.partnerPhone ? (
                    <a
                        href={`tel:${conversation.partnerPhone}`}
                        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title={`Call ${conversation.partnerPhone}`}
                    >
                        <Phone className="h-5 w-5" />
                    </a>
                ) : (
                    <button
                        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed transition-colors"
                        title="Phone number not available"
                        disabled
                    >
                        <Phone className="h-5 w-5" />
                    </button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            title="More options"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setShowDetails(true)}>
                            <User className="w-4 h-4 mr-2" />
                            <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setShowRate(true)}>
                            <Star className="w-4 h-4 mr-2" />
                            <span>Rate User</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setShowReport(true)}>
                            <Flag className="w-4 h-4 mr-2" />
                            <span>Report User</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <UserDetailsDialog
                open={showDetails}
                onOpenChange={setShowDetails}
                conversation={conversation}
                targetRole={targetRole}
            />

            <RateUserDialog
                open={showRate}
                onOpenChange={setShowRate}
                targetId={partnerId}
                targetRole={targetRole}
                currentRole={role}
                partnerName={partnerName}
            />

            <ReportUserDialog
                open={showReport}
                onOpenChange={setShowReport}
                targetId={partnerId}
                targetRole={targetRole}
                currentRole={role}
                partnerName={partnerName}
            />
        </div>
    )
}
