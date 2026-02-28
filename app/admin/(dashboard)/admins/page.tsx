import { getAdmins, getRoles, getDepartments } from "@/app/actions/admin"
import { AdminsClient } from "./admins-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminAccountsPage() {
    const [admins, roles, departments] = await Promise.all([
        getAdmins(),
        getRoles(),
        getDepartments()
    ])

    return (
        <div className="space-y-4">
            <AdminsClient data={admins} roles={roles} departments={departments} />
        </div>
    )
}
