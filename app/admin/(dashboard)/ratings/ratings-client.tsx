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
import { MoreHorizontal, Trash2, Star } from "lucide-react"
import { useTransition } from "react"
import { deleteRating } from "@/app/actions/admin"
import { format } from "date-fns"

export function RatingsClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "rater_id",
            header: "Rater ID",
            cell: ({ row }) => `${row.original.rater_id} (${row.original.rater_type === 0 ? "Buyer" : "Seller"})`
        },
        {
            accessorKey: "rated_id",
            header: "Rated User ID",
            cell: ({ row }) => `${row.original.rated_id} (${row.original.rated_type === 0 ? "Buyer" : "Seller"})`
        },
        {
            accessorKey: "rating",
            header: "Score",
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{row.original.rating}/5</span>
                </div>
            )
        },
        {
            accessorKey: "comment",
            header: "Comment",
            cell: ({ row }) => <span className="truncate max-w-[250px] inline-block">{row.original.comment || "—"}</span>
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
                                    if (confirm("Are you sure you want to delete this rating permanently?")) {
                                        await deleteRating(item.id)
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
        />
    )
}
