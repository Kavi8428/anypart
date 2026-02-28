import { getAppDetails } from "@/app/actions/admin"
import { SettingsClient } from "./settings-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminSettingsPage() {
    const appDetails = await getAppDetails()

    return (
        <div className="space-y-4 max-w-4xl">
            <PageHeader
                title="Application Settings"
                description="Manage global details such as contact info and branding."
            />
            <SettingsClient data={appDetails} />
        </div>
    )
}
