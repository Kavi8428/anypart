"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash } from "lucide-react"
import Image from "next/image"
import { deleteProduct } from "@/app/actions/products"
const toast = {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
}

export type ProductColumn = {
    id: number
    p_name: string
    v_model: string
    v_brand: string
    price: number
    condition: string
    image_url: string
    v_year: number | string
    is_featured: number
}

interface ColumnProps {
    onEdit: (id: number) => void
}

export const getColumns = ({ onEdit }: ColumnProps): ColumnDef<ProductColumn>[] => [
    {
        accessorKey: "image_url",
        header: "Image",
        cell: ({ row }) => {
            return (
                <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                    <Image
                        src={row.original.image_url || "/placeholder-product.png"}
                        alt={row.original.p_name}
                        fill
                        className="object-cover"
                    />
                </div>
            )
        },
    },
    {
        accessorKey: "p_name",
        header: "Product Name",
    },
    {
        accessorKey: "is_featured",
        header: "Featured",
        cell: ({ row }) => {
            const isFeatured = row.original.is_featured === 1
            return (
                <div className="flex items-center justify-center">
                    {isFeatured ? (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Featured</Badge>
                    ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "v_brand",
        header: "Brand",
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.v_brand}</Badge>
        ),
    },
    {
        accessorKey: "v_model",
        header: "Model",
    },
    {
        accessorKey: "v_year",
        header: "Year",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-LK", {
                style: "currency",
                currency: "LKR",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => {
            return (
                <Badge variant={row.original.condition === "New" ? "default" : "secondary"}>
                    {row.original.condition}
                </Badge>
            )
        },
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
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onEdit(product.id)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                                const ok = confirm("Are you sure you want to delete this product?")
                                if (ok) {
                                    try {
                                        await deleteProduct(product.id)
                                        toast.success("Product deleted successfully")
                                    } catch (error) {
                                        toast.error("Failed to delete product")
                                    }
                                }
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
