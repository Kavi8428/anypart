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
import { toggleBuyerVerify, deleteBuyer } from "@/app/actions/admin"
import { useTransition, useState } from "react"
import { BuyerDetailsDialog } from "./buyer-details-dialog"

export function BuyersClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "full_name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
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
                const buyer = row.original

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
                                onClick={() => {
                                    setSelectedBuyerId(buyer.id)
                                    setDialogOpen(true)
                                }}
                            >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    await toggleBuyerVerify(buyer.id, buyer.verified)
                                })}
                            >
                                <BadgeCheck className="mr-2 h-4 w-4" /> Toggle Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this buyer?")) {
                                        await deleteBuyer(buyer.id)
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
        <>
            <DataTable
                columns={columns}
                data={data}
                searchKey="full_name"
            />

            <BuyerDetailsDialog
                buyerId={selectedBuyerId}
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setSelectedBuyerId(null)
                }}
            />
        </>
    )
}
