import { getBuyerDetails, getBuyerCredits, getUnlockedProducts, getPaymentHistory, getCreditPackages } from "@/app/actions/buyer"
import { BuyerProfile } from "@/components/buyer/BuyerProfile"
import { redirect } from "next/navigation"

export const metadata = {
    title: "My Profile | anypart.lk",
    description: "Manage your anypart.lk buyer profile",
}

export default async function ProfilePage() {
    const buyer = await getBuyerDetails()

    if (!buyer) {
        redirect("/buyer")
    }

    const credits = await getBuyerCredits()
    const unlockedProducts = await getUnlockedProducts()
    const paymentHistory = await getPaymentHistory()
    const packages = await getCreditPackages()

    return (
        <BuyerProfile
            buyer={buyer}
            credits={credits}
            unlockedProducts={unlockedProducts}
            paymentHistory={paymentHistory}
            packages={packages}
        />
    )
}
