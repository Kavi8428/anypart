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
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { useTransition, useState } from "react"
import { createVehicleModel, updateVehicleModel, deleteVehicleModel } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export function VModelsClient({ data, brands }: { data: any[], brands: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "v_brands.name",
            header: "Brand",
            cell: ({ row }) => row.original.v_brands?.name || "—",
        },
        {
            accessorKey: "name",
            header: "Model Name",
        },
        {
            accessorKey: "v_years.year",
            header: "Year",
            cell: ({ row }) => row.original.v_years?.year || "—",
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const model = row.original

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
                                    setEditing(model)
                                    setOpen(true)
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this model?")) {
                                        await deleteVehicleModel(model.id)
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

    async function onSubmit(formData: FormData) {
        startTransition(async () => {
            if (editing) {
                await updateVehicleModel(editing.id, formData)
            } else {
                await createVehicleModel(formData)
            }
            setOpen(false)
            setEditing(null)
        })
    }

    return (
        <>
            <PageHeader
                title="Vehicle Models"
                description="Manage vehicle models available on the platform."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Model
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                searchKey="name"
            />

            <CrudDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v)
                    if (!v) setEditing(null)
                }}
                title={editing ? "Edit Vehicle Model" : "Add Vehicle Model"}
                description={editing ? "Update details for the model" : "Create a new vehicle model attached to a brand"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="v_brand">Vehicle Brand</Label>
                        <select
                            id="v_brand"
                            name="v_brand"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={editing?.v_brand || ""}
                            required
                        >
                            <option value="" disabled>Select a brand...</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Model Name</Label>
                        <Input id="name" name="name" defaultValue={editing?.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" name="description" defaultValue={editing?.description || ""} />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CrudDialog>
        </>
    )
}
