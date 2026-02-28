import { getPaymentMethods } from "@/app/actions/admin"
import { PaymentMethodsClient } from "./payment-methods-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminPaymentMethodsPage() {
    const data = await getPaymentMethods()

    return (
        <div className="space-y-4">
            <PaymentMethodsClient data={data} />
        </div>
    )
}
