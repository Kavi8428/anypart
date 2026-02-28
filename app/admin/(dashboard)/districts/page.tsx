import { getDistricts } from "@/app/actions/admin"
import { DistrictsClient } from "./districts-client"

export default async function AdminDistrictsPage() {
    const districts = await getDistricts()

    return (
        <div className="space-y-4">
            <DistrictsClient data={districts} />
        </div>
    )
}
