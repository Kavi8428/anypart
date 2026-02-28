import { getVehicleBrands } from "@/app/actions/admin"
import { VBrandsClient } from "./v-brands-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminVehicleBrandsPage() {
    const brands = await getVehicleBrands()

    return (
        <div className="space-y-4">
            <VBrandsClient data={brands} />
        </div>
    )
}
