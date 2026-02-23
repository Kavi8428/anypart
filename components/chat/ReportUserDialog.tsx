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
import { reportUser } from "@/app/actions/chat/user-feedback"

export type ReportUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetId: number
    targetRole: "buyer" | "seller"
    currentRole: "buyer" | "seller"
    partnerName: string
}

export function ReportUserDialog({
    open,
    onOpenChange,
    targetId,
    targetRole,
    currentRole,
    partnerName,
}: ReportUserDialogProps) {
    const [reason, setReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for the report.")
            return
        }

        setIsSubmitting(true)
        setError("")
        const res = await reportUser(targetId, targetRole, reason, currentRole)
        setIsSubmitting(false)

        if (res.error) {
            setError(res.error)
        } else {
            setSuccessMessage("Your report has been submitted to the admin.")
            setTimeout(() => {
                onOpenChange(false)
                setSuccessMessage("")
                setReason("")
            }, 2000)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Report {partnerName}</DialogTitle>
                    <DialogDescription>
                        Please explain why you are reporting this user. This action cannot be undone and will be reviewed by our admin team.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 flex flex-col">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for report..."
                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
                        rows={4}
                    />

                    {error && <div className="text-sm font-medium text-destructive">{error}</div>}
                    {successMessage && <div className="text-sm font-medium text-green-600">{successMessage}</div>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason.trim()}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
