"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, Trash2, AlertCircle } from "lucide-react"
import { useTransition } from "react"
import { updateReportStatus, deleteReport } from "@/app/actions/admin"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function ReportsClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "reporter_id",
            header: "Reporter ID",
            cell: ({ row }) => `${row.original.reporter_id} (${row.original.reporter_type === 0 ? "Buyer" : "Seller"})`
        },
        {
            accessorKey: "reported_id",
            header: "Reported ID",
            cell: ({ row }) => `${row.original.reported_id} (${row.original.reported_type === 0 ? "Buyer" : "Seller"})`
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => <span className="truncate max-w-[300px] inline-block">{row.original.reason}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === "pending" ? "default" : (row.original.status === "resolved" ? "secondary" : "destructive")}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    await updateReportStatus(item.id, item.status === "pending" ? "resolved" : "pending")
                                })}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Toggle Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this report?")) {
                                        await deleteReport(item.id)
                                    }
                                })}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="reason"
        />
    )
}
