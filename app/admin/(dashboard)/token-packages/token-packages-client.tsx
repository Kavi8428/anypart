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
import { createTokenPackage, updateTokenPackage, deleteTokenPackage } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export function TokenPackagesClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "amount",
            header: "Price (LKR)",
            cell: ({ row }) => `Rs. ${row.original.amount.toFixed(2)}`
        },
        {
            accessorKey: "token_count",
            header: "Tokens Configured",
            cell: ({ row }) => `${row.original.token_count} Tokens`
        },
        {
            accessorKey: "validity_period",
            header: "Validity",
            cell: ({ row }) => `${row.original.validity_period} Days`
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
                                    if (confirm("Are you sure? Existing payment records linked to this package will be orphaned.")) {
                                        await deleteTokenPackage(item.id)
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
                await updateTokenPackage(editing.id, formData)
            } else {
                await createTokenPackage(formData)
            }
            setOpen(false)
            setEditing(null)
        })
    }

    return (
        <>
            <PageHeader
                title="Token Packages"
                description="Manage token pricing plans built for buyers."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Package
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                searchKey="amount"
            />

            <CrudDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v)
                    if (!v) setEditing(null)
                }}
                title={editing ? "Edit Token Package" : "Add Token Package"}
                description={editing ? "Update details for the package" : "Create a new token pricing package"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Price Amount (LKR)</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" defaultValue={editing?.amount} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="token_count">Token Count (Provided)</Label>
                        <Input id="token_count" name="token_count" type="number" defaultValue={editing?.token_count} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="validity_period">Validity (Days)</Label>
                        <Input id="validity_period" name="validity_period" type="number" defaultValue={editing?.validity_period} required />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CrudDialog>
        </>
    )
}
