"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ChatConversation } from "./types"
import { Phone, Star, MapPin } from "lucide-react"
import { getUserRatingStats } from "@/app/actions/chat/user-feedback"
import { useEffect, useState } from "react"
import Image from "next/image"
import clsx from "clsx"

type UserDetailsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    conversation: ChatConversation | null
    targetRole: "buyer" | "seller"
}

export function UserDetailsDialog({ open, onOpenChange, conversation, targetRole }: UserDetailsDialogProps) {
    const [stats, setStats] = useState<{ average: number; count: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function fetchStats() {
            if (open && conversation?.partnerId) {
                setIsLoading(true)
                try {
                    const res = await getUserRatingStats(conversation.partnerId, targetRole)
                    if (isMounted) {
                        setStats(res)
                    }
                } finally {
                    if (isMounted) setIsLoading(false)
                }
            } else {
                setStats(null)
            }
        }

        fetchStats()

        return () => { isMounted = false }
    }, [open, conversation?.partnerId, targetRole])

    if (!conversation) return null

    const { partnerName, partnerAvatar, partnerPhone, partnerDetails, online } = conversation

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>
                    <DialogDescription className="sr-only">
                        Detailed profile information of the chat participant.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center pt-4 pb-6 gap-4 border-b">
                    <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-muted bg-muted flex items-center justify-center shadow-sm">
                            {partnerAvatar ? (
                                <Image
                                    src={partnerAvatar}
                                    alt={partnerName}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="font-semibold text-4xl text-muted-foreground uppercase">
                                    {partnerName?.charAt(0) || "?"}
                                </span>
                            )}
                        </div>
                        {online && (
                            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-background bg-green-500 shadow-sm" />
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">{partnerName}</h2>
                        {partnerDetails?.sellerType && (
                            <p className="text-sm font-medium text-primary bg-primary/10 inline-flex items-center px-2 py-0.5 rounded-full mb-1">
                                {partnerDetails.sellerType}
                            </p>
                        )}

                        {/* Rating Display */}
                        <div className="flex items-center justify-center gap-1.5 mt-2 mb-2">
                            {isLoading ? (
                                <span className="text-xs text-muted-foreground">Loading rating...</span>
                            ) : stats && stats.count > 0 ? (
                                <>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={clsx(
                                                    "w-4 h-4",
                                                    star <= Math.round(stats.average)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-muted text-muted"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">{stats.average.toFixed(1)}</span>
                                    <span className="text-xs text-muted-foreground ml-1">({stats.count} {stats.count === 1 ? 'review' : 'reviews'})</span>
                                </>
                            ) : (
                                <span className="text-xs text-muted-foreground">No ratings yet</span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                            {online ? (
                                <span className="text-green-600 font-medium">Online Now</span>
                            ) : (
                                <span>Currently Offline</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 py-4">
                    {/* Phone Numbers */}
                    {(partnerPhone || partnerDetails?.tel2) && (
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Phone Number</span>
                                {partnerPhone && (
                                    <a href={`tel:${partnerPhone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {partnerPhone}
                                    </a>
                                )}
                                {partnerDetails?.tel2 && (
                                    <a href={`tel:${partnerDetails.tel2}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {partnerDetails.tel2} (Secondary)
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {(partnerDetails?.address || partnerDetails?.city || partnerDetails?.district) && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Location</span>
                                {partnerDetails.address && (
                                    <span className="text-sm text-muted-foreground">
                                        {partnerDetails.address}
                                    </span>
                                )}
                                {(partnerDetails.city || partnerDetails.district) && (
                                    <span className="text-sm text-muted-foreground">
                                        {[partnerDetails.city, partnerDetails.district].filter(Boolean).join(", ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fallback if no extra details exist */}
                    {!partnerPhone && !partnerDetails?.address && !partnerDetails?.city && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No additional details available for this user.
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}
