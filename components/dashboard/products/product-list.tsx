"use client"

import * as React from "react"
import { ProductColumn, getColumns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { getProductMetaData } from "@/app/actions/product-meta"

export type ProductDetail = {
    id: number;
    p_name: number;
    v_model: number;
    v_year: number;
    price: number;
    condition: number;
    description: string;
    hash_tag_1: number;
    hash_tag_2: number;
    hash_tag_3: number;
    is_featured: number;
    image_url_1: string;
    image_url_2?: string;
    image_url_3?: string;
};

interface ProductListProps {
    data: ProductColumn[]
    rawProducts: ProductDetail[]
}

export function ProductList({ data, rawProducts }: ProductListProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [initialData, setInitialData] = React.useState<ProductDetail | null>(null)
    const [metaData, setMetaData] = React.useState<{
        pNames: { id: number; name: string }[];
        vModels: { id: number; name: string; v_brands: { name: string } }[];
        conditions: { id: number; status: string }[];
        tags: { id: number; name: string }[];
        vYears: { id: number; year: number }[];
    }>({
        pNames: [],
        vModels: [],
        conditions: [],
        tags: [],
        vYears: [],
    })

    React.useEffect(() => {
        const fetchMeta = async () => {
            const meta = await getProductMetaData()
            setMetaData(meta)
        }
        fetchMeta()
    }, [])

    const onEdit = React.useCallback((id: number) => {
        const product = (rawProducts as ProductDetail[]).find((p) => p.id === id)
        // Ensure initialData includes the is_featured property for the form
        // The ProductForm component will then use this to set its internal state for the checkbox.
        setInitialData(product || null)
        setIsOpen(true)
    }, [rawProducts])

    const columns = React.useMemo(() => getColumns({ onEdit }), [onEdit])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Products</h2>
                <Button onClick={() => {
                    setInitialData(null)
                    setIsOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={data}
                searchKey="p_name"
            />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        initialData={initialData}
                        metaData={metaData}
                        onSuccess={() => {
                            setIsOpen(false)
                            // Since it's server components for the list, we might need a refresh or revalidate
                            window.location.reload()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
