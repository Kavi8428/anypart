import { getPaymentStatuses } from "@/app/actions/admin"
import { PaymentStatusClient } from "./payment-status-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminPaymentStatusPage() {
    const data = await getPaymentStatuses()

    return (
        <div className="space-y-4">
            <PaymentStatusClient data={data} />
        </div>
    )
}
