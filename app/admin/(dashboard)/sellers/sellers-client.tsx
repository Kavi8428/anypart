"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { toggleSellerVerify, deleteSeller } from "@/app/actions/admin"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function SellersClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Seller Name",
        },
        {
            accessorKey: "user_name",
            header: "Username",
        },
        {
            accessorKey: "seller_types.type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.seller_types?.type || "Unknown"}</Badge>
            )
        },
        {
            accessorKey: "cities.name",
            header: "City",
            cell: ({ row }) => row.original.cities?.name || "N/A",
        },
        {
            accessorKey: "verified",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.verified === 1 ? "default" : "secondary"}>
                    {row.original.verified === 1 ? "Verified" : "Unverified"}
                </Badge>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Registered",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const seller = row.original

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
                                onClick={() => router.push(`/admin/sellers/${seller.id}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    await toggleSellerVerify(seller.id, seller.verified)
                                })}
                            >
                                <BadgeCheck className="mr-2 h-4 w-4" /> Toggle Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this seller?")) {
                                        await deleteSeller(seller.id)
                                    }
                                })}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Soft Delete
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
            searchKey="name"
        />
    )
}
