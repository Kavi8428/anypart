"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Star, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { toggleProductFeatured, deleteProduct } from "@/app/actions/admin"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function ProductsClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "p_name_ref.name",
            header: "Part Name",
            cell: ({ row }) => row.original.p_name_ref?.name || "Unknown",
        },
        {
            accessorKey: "seller_details.name",
            header: "Seller",
            cell: ({ row }) => row.original.seller_details?.name || "Unknown",
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => `Rs ${row.original.price?.toLocaleString() || 0}`,
        },
        {
            accessorKey: "is_featured",
            header: "Featured",
            cell: ({ row }) => (
                <Badge variant={row.original.is_featured === 1 ? "default" : "secondary"}>
                    {row.original.is_featured === 1 ? "Featured" : "Standard"}
                </Badge>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const product = row.original

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
                                onClick={() => router.push(`/buyer/product_view/${product.id}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" /> View Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    await toggleProductFeatured(product.id, product.is_featured)
                                })}
                            >
                                <Star className="mr-2 h-4 w-4" /> Toggle Featured
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this product?")) {
                                        await deleteProduct(product.id)
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
        />
    )
}
