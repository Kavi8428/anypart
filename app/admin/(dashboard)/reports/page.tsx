import { getReports } from "@/app/actions/admin"
import { ReportsClient } from "./reports-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminReportsPage() {
    const data = await getReports()

    return (
        <div className="space-y-4">
            <PageHeader
                title="User Reports"
                description="Manage user reports and review reported content."
            />
            <ReportsClient data={data} />
        </div>
    )
}
