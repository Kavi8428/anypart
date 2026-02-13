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

interface ProductListProps {
    data: ProductColumn[]
    rawProducts: any[] // We need raw database records to populate the form fully
}

export function ProductList({ data, rawProducts }: ProductListProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [initialData, setInitialData] = React.useState<any>(null)
    const [metaData, setMetaData] = React.useState<any>({
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

    const onEdit = (id: number) => {
        const product = rawProducts.find((p) => p.id === id)
        // Ensure initialData includes the is_featured property for the form
        // The ProductForm component will then use this to set its internal state for the checkbox.
        setInitialData(product)
        setIsOpen(true)
    }

    const columns = React.useMemo(() => getColumns({ onEdit }), [rawProducts])

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
