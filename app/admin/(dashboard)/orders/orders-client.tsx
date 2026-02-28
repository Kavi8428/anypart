"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function OrdersClient({ data }: { data: any[] }) {
    const router = useRouter()

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Order ID",
        },
        {
            accessorKey: "buyer_details.full_name",
            header: "Buyer",
            cell: ({ row }) => row.original.buyer_details?.full_name || "Unknown",
        },
        {
            accessorKey: "seller_products.p_name_ref.name",
            header: "Product (Part Name)",
            cell: ({ row }) => row.original.seller_products?.p_name_ref?.name || "Unknown",
        },
        {
            accessorKey: "is_viewed",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.is_viewed === 1 ? "default" : "secondary"}>
                    {row.original.is_viewed === 1 ? "Viewed" : "Unviewed"}
                </Badge>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy h:mm a"),
        }
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
        />
    )
}
