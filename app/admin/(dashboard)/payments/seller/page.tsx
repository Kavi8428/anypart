import { getSellerPayments } from "@/app/actions/admin"
import { SellerPaymentsClient } from "./seller-payments-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminSellerPaymentsPage() {
    const data = await getSellerPayments()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Seller Payments"
                description="Monitor successful product tier purchases and package upgrades made by sellers."
            />
            <SellerPaymentsClient data={data} />
        </div>
    )
}
