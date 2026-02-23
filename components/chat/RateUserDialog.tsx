"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { rateUser } from "@/app/actions/chat/user-feedback"
import clsx from "clsx"

export type RateUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetId: number
    targetRole: "buyer" | "seller"
    currentRole: "buyer" | "seller"
    partnerName: string
}

export function RateUserDialog({
    open,
    onOpenChange,
    targetId,
    targetRole,
    currentRole,
    partnerName,
}: RateUserDialogProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a rating from 1 to 5 stars.")
            return
        }

        setIsSubmitting(true)
        setError("")
        const res = await rateUser(targetId, targetRole, rating, comment, currentRole)
        setIsSubmitting(false)

        if (res.error) {
            setError(res.error)
        } else {
            setSuccessMessage("Thank you! Your rating has been submitted.")
            setTimeout(() => {
                onOpenChange(false)
                // Rest form for next time
                setSuccessMessage("")
                setRating(0)
                setComment("")
            }, 2000)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate {partnerName}</DialogTitle>
                    <DialogDescription>
                        Please provide a rating and optional feedback for your experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 flex flex-col items-center">
                    {/* Stars */}
                    <div
                        className="flex gap-2"
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={clsx(
                                    "w-10 h-10 cursor-pointer transition-colors",
                                    (hoverRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-muted text-muted"
                                )}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Leave a comment (optional)..."
                        className="w-full mt-4 bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        rows={3}
                    />

                    {error && <div className="text-sm font-medium text-destructive">{error}</div>}
                    {successMessage && <div className="text-sm font-medium text-green-600">{successMessage}</div>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? "Submitting..." : "Submit Rating"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
