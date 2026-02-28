"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function SellerPaymentsClient({ data }: { data: any[] }) {

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "order_id",
            header: "Order / Ref ID",
        },
        {
            accessorKey: "seller_details.name",
            header: "Seller",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.seller_details?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">ID: {row.original.seller_id}</span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Billed Amount",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.currency} {row.original.amount.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">Method: {row.original.method_ref?.method || "N/A"}</span>
                </div>
            )
        },
        {
            accessorKey: "payhere_amount",
            header: "PayHere Net",
            cell: ({ row }) => row.original.payhere_amount ? `LKR ${row.original.payhere_amount.toFixed(2)}` : "—"
        },
        {
            accessorKey: "status_ref.status",
            header: "Current Status",
            cell: ({ row }) => {
                const status = row.original.status_ref?.status || "Unknown"
                let variant: "default" | "secondary" | "destructive" | "outline" = "default"
                if (status.toLowerCase().includes("pending")) variant = "secondary"
                if (status.toLowerCase().includes("fail") || status.toLowerCase().includes("cancel")) variant = "destructive"
                if (status.toLowerCase().includes("success") || status.toLowerCase().includes("complete")) variant = "default"

                return <Badge variant={variant}>{status}</Badge>
            }
        },
        {
            accessorKey: "created_at",
            header: "Date Recorded",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy HH:mm"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <Button variant="ghost" size="sm" onClick={() => alert("Detailed view pending implementation")}>
                        <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                )
            },
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="order_id"
        />
    )
}
