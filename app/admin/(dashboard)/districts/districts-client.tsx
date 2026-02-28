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
import { createDistrict, updateDistrict, deleteDistrict } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export function DistrictsClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "District Name",
        },
        {
            accessorKey: "updated_at",
            header: "Last Updated",
            cell: ({ row }) => format(new Date(row.original.updated_at), "MMM d, yyyy"),
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
                                onClick={() => {
                                    setEditing(item)
                                    setOpen(true)
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this district?")) {
                                        await deleteDistrict(item.id)
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
            let res;
            if (editing) {
                res = await updateDistrict(editing.id, formData)
            } else {
                res = await createDistrict(formData)
            }

            if (res?.error) {
                alert(res.error)
            } else {
                setOpen(false)
                setEditing(null)
            }
        })
    }

    return (
        <>
            <PageHeader
                title="Districts"
                description="Manage valid districts in the system."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add District
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
                title={editing ? "Edit District" : "Add District"}
                description={editing ? "Update details for the district" : "Create a new district"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">District Name</Label>
                        <Input id="name" name="name" defaultValue={editing?.name} required />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CrudDialog>
        </>
    )
}
