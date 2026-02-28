import { getPromotions } from "@/app/actions/admin"
import { PromotionsClient } from "./promotions-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminPromotionsPage() {
    const data = await getPromotions()

    return (
        <div className="space-y-4">
            <PromotionsClient data={data} />
        </div>
    )
}
