import { getRatings } from "@/app/actions/admin"
import { RatingsClient } from "./ratings-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminRatingsPage() {
    const data = await getRatings()

    return (
        <div className="space-y-4">
            <PageHeader
                title="User Ratings"
                description="Monitor user-to-user ratings and reviews."
            />
            <RatingsClient data={data} />
        </div>
    )
}
