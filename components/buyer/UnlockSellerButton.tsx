"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Lock, Loader2 } from "lucide-react"
import { unlockSellerDetails } from "@/app/actions/buyer"
import { useRouter } from "next/navigation"

export function UnlockSellerButton({
    productId,
    initialCredits
}: {
    productId: number,
    initialCredits: number
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleUnlock = () => {
        if (initialCredits <= 0) {
            // Redirect to credits purchase page or show modal
            alert("You have 0 credits. Please purchase a package.")
            return
        }

        if (confirm("Spend 1 credit to view seller details?")) {
            startTransition(async () => {
                const result = await unlockSellerDetails(productId)
                if (result.success) {
                    router.refresh()
                } else {
                    alert(result.message)
                }
            })
        }
    }

    if (initialCredits <= 0) {
        return (
            <Button
                onClick={handleUnlock}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
                <Lock className="w-4 h-4 mr-2" />
                Buy Credits to View
            </Button>
        )
    }

    return (
        <Button
            onClick={handleUnlock}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlocking...
                </>
            ) : (
                <>
                    <Eye className="w-4 h-4 mr-2" />
                    Unlock Seller Details (1 Credit)
                </>
            )}
        </Button>
    )
}
