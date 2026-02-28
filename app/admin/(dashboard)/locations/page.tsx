import { getDistricts, getCities } from "@/app/actions/admin"
import { LocationsClient } from "./locations-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminLocationsPage() {
    const [districts, cities] = await Promise.all([
        getDistricts(),
        getCities()
    ])

    return (
        <div className="space-y-4">
            <LocationsClient data={cities} districts={districts} />
        </div>
    )
}
