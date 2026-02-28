import { getBuyers } from "@/app/actions/admin"
import { BuyersClient } from "./buyers-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminBuyersPage() {
    const buyers = await getBuyers()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Buyers"
                description="View and manage all registered buyers on the platform."
            />
            <BuyersClient data={buyers} />
        </div>
    )
}
