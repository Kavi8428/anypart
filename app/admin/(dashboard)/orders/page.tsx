import { getOrders } from "@/app/actions/admin"
import { OrdersClient } from "./orders-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminOrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-4">
            <PageHeader
                title="Orders"
                description="View all orders (unlocks) made by buyers."
            />
            <OrdersClient data={orders} />
        </div>
    )
}
