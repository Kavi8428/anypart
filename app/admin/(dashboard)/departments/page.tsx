import { getDepartments } from "@/app/actions/admin"
import { DepartmentsClient } from "./departments-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminDepartmentsPage() {
    const data = await getDepartments()

    return (
        <div className="space-y-4">
            <DepartmentsClient data={data} />
        </div>
    )
}
