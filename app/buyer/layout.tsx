import { BuyerHeader } from "@/components/buyer/BuyerHeader"
import { BottomNav } from "@/components/buyer/BottomNav"
import { BuyerFooter } from "@/components/buyer/BuyerFooter"
import { getBuyerSession } from "@/lib/auth"

export default async function BuyerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getBuyerSession()

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <BuyerHeader user={session?.buyer_details} />
            <main className="flex-1">
                {children}
            </main>
            <BuyerFooter />
            <BottomNav />
        </div>
    )
}
