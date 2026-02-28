import { getVehicleModels, getVehicleBrands } from "@/app/actions/admin"
import { VModelsClient } from "./v-models-client"

export default async function AdminVehicleModelsPage() {
    const [models, brands] = await Promise.all([
        getVehicleModels(),
        getVehicleBrands()
    ])

    return (
        <div className="space-y-4">
            <VModelsClient data={models} brands={brands} />
        </div>
    )
}
