import { getSellers } from "@/app/actions/admin"
import { SellersClient } from "./sellers-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminSellersPage() {
    const sellers = await getSellers()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Sellers"
                description="View and manage all registered sellers, their verify status, and associated products."
            />
            <SellersClient data={sellers} />
        </div>
    )
}
