import { getHashTags } from "@/app/actions/admin"
import { HashTagsClient } from "./hash-tags-client"
import { PageHeader } from "@/components/admin/page-header"

export default async function AdminHashTagsPage() {
    const data = await getHashTags()

    return (
        <div className="space-y-4">
            <HashTagsClient data={data} />
        </div>
    )
}
