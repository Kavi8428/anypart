import { getProducts } from "@/app/actions/admin"
import { ProductsClient } from "./products-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminProductsPage() {
    const products = await getProducts()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Products"
                description="View and manage all active products across the platform."
            />
            <ProductsClient data={products} />
        </div>
    )
}
