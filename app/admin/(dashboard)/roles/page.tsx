import { getRoles } from "@/app/actions/admin"
import { RolesClient } from "./roles-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminRolesPage() {
    const data = await getRoles()

    return (
        <div className="space-y-4">
            <RolesClient data={data} />
        </div>
    )
}
