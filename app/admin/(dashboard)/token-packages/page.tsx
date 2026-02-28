import { getTokenPackages } from "@/app/actions/admin"
import { TokenPackagesClient } from "./token-packages-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminTokenPackagesPage() {
    const data = await getTokenPackages()

    return (
        <div className="space-y-4">
            <TokenPackagesClient data={data} />
        </div>
    )
}
