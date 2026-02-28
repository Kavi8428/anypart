import { getPartNames, getPartBrands } from "@/app/actions/admin"
import { PModelsClient } from "./p-models-client"

export default async function AdminPartModelsPage() {
    const [models, brands] = await Promise.all([
        getPartNames(),
        getPartBrands()
    ])

    return (
        <div className="space-y-4">
            <PModelsClient data={models} brands={brands} />
        </div>
    )
}
