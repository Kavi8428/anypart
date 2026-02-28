import { getBuyerPayments } from "@/app/actions/admin"
import { BuyerPaymentsClient } from "./buyer-payments-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminBuyerPaymentsPage() {
    const data = await getBuyerPayments()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Buyer Payments"
                description="Monitor all token purchases and order unlock payments made by buyers."
            />
            <BuyerPaymentsClient data={data} />
        </div>
    )
}
