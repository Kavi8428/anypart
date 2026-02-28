import { getDistricts, getCities } from "@/app/actions/admin"
import { CitiesClient } from "./cities-client"

export default async function AdminCitiesPage() {
    const [districts, cities] = await Promise.all([
        getDistricts(),
        getCities()
    ])

    return (
        <div className="space-y-4">
            <CitiesClient data={cities} districts={districts} />
        </div>
    )
}
