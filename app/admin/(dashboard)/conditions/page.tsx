import { getConditions } from "@/app/actions/admin"
import { ConditionsClient } from "./conditions-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminConditionsPage() {
    const data = await getConditions()

    return (
        <div className="space-y-4">
            <ConditionsClient data={data} />
        </div>
    )
}
