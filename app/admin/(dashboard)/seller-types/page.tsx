import { getSellerTypes } from "@/app/actions/admin"
import { SellerTypesClient } from "./seller-types-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminSellerTypesPage() {
    const data = await getSellerTypes()

    return (
        <div className="space-y-4">
            <SellerTypesClient data={data} />
        </div>
    )
}
