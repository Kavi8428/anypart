"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function BuyerPaymentsClient({ data }: { data: any[] }) {

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Payment ID",
        },
        {
            accessorKey: "buyer_details.full_name",
            header: "Buyer",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.buyer_details?.full_name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">ID: {row.original.buyer_id}</span>
                </div>
            )
        },
        {
            accessorKey: "buyer_amounts",
            header: "Package / Amount",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">Rs. {row.original.buyer_amounts?.amount.toFixed(2) || "0.00"}</span>
                    <span className="text-xs text-muted-foreground">{row.original.buyer_amounts?.token_count || 0} Tokens ({row.original.buyer_amounts?.validity_period || 0}D)</span>
                </div>
            )
        },
        {
            accessorKey: "payment_status.status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.payment_status?.status || "Unknown"
                let variant: "default" | "secondary" | "destructive" | "outline" = "default"
                if (status.toLowerCase().includes("pending")) variant = "secondary"
                if (status.toLowerCase().includes("fail") || status.toLowerCase().includes("cancel")) variant = "destructive"
                if (status.toLowerCase().includes("success") || status.toLowerCase().includes("complete")) variant = "default"

                return <Badge variant={variant}>{status}</Badge>
            }
        },
        {
            accessorKey: "created_at",
            header: "Date",
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
        />
    )
}
