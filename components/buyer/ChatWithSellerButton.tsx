"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2, CreditCard, Lock } from "lucide-react"
import { unlockSellerDetails } from "@/app/actions/buyer"
import { useRouter } from "next/navigation"
import { BuyerSignInDialog } from "./auth/BuyerSignInDialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function ChatWithSellerButton({
    productId,
    isSignedIn,
    hasCredits,
    isUnlocked
}: {
    productId: number
    isSignedIn: boolean
    hasCredits: boolean
    isUnlocked: boolean
}) {
    const [isPending, startTransition] = useTransition()
    const [showCreditDialog, setShowCreditDialog] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const router = useRouter()

    const handleClick = () => {
        // Not signed in - show sign in dialog
        if (!isSignedIn) {
            // The BuyerSignInDialog wrapper handles this automatically
            return
        }

        // Already unlocked - redirect to chat
        if (isUnlocked) {
            router.push(`/buyer/chat?product=${productId}`)
            return
        }

        // Need to unlock first
        if (!hasCredits) {
            setShowCreditDialog(true)
            return
        }

        // Has credits, show confirmation
        setShowConfirmDialog(true)
    }

    const handleUnlock = () => {
        startTransition(async () => {
            const result = await unlockSellerDetails(productId)
            if (result.success) {
                setShowConfirmDialog(false)
                router.refresh()
            } else {
                alert(result.message)
                setShowConfirmDialog(false)
            }
        })
    }

    if (!isSignedIn) {
        return (
            <BuyerSignInDialog>
                <Button
                    variant="outline"
                    className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 h-9 sm:h-10 text-xs sm:text-sm font-bold rounded-lg"
                >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Chat with Seller
                </Button>
            </BuyerSignInDialog>
        )
    }

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={isPending}
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 h-9 sm:h-10 text-xs sm:text-sm font-bold rounded-lg"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Unlocking...
                    </>
                ) : (
                    <>
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Chat with Seller
                    </>
                )}
            </Button>

            {/* Insufficient Credits Dialog */}
            <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <CreditCard className="w-5 h-5" />
                            Insufficient Credits
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            You need explicit credits to chat with sellers. This helps us maintain a high-quality marketplace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <Lock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-orange-900">Unlock Seller Chat</p>
                                <p className="text-xs text-orange-700">Cost: 1 Credit</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreditDialog(false)}>Cancel</Button>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 font-bold"
                            onClick={() => router.push("/buyer/profile?tab=credits")}
                        >
                            Top-up Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Unlock Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Unlock Chat Access?</DialogTitle>
                        <DialogDescription>
                            This will dedicate **1 Credit** from your balance to unlock this seller&apos;s details and enable chat.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleUnlock}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Unlocking...
                                </>
                            ) : (
                                "Confirm & Unlock"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
