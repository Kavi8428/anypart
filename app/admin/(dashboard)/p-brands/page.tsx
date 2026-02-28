import { getPartBrands } from "@/app/actions/admin"
import { PBrandsClient } from "./p-brands-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminPartBrandsPage() {
    const brands = await getPartBrands()

    return (
        <div className="space-y-4">
            <PBrandsClient data={brands} />
        </div>
    )
}
