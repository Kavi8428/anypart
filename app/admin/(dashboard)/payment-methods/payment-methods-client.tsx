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
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export function PaymentMethodsClient({ data }: { data: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "method",
            header: "Method Name",
        },
        {
            accessorKey: "definition",
            header: "Definition",
            cell: ({ row }) => <span className="truncate max-w-[300px] inline-block">{row.original.definition || "—"}</span>
        },
        {
            accessorKey: "created_at",
            header: "Created",
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
                                onClick={() => {
                                    setEditing(item)
                                    setOpen(true)
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this payment method?")) {
                                        await deletePaymentMethod(item.id)
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
                await updatePaymentMethod(editing.id, formData)
            } else {
                await createPaymentMethod(formData)
            }
            setOpen(false)
            setEditing(null)
        })
    }

    return (
        <>
            <PageHeader
                title="Payment Methods"
                description="Manage valid payment gateways & methods (PayHere, Cash, etc)."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Method
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                searchKey="method"
            />

            <CrudDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v)
                    if (!v) setEditing(null)
                }}
                title={editing ? "Edit Payment Method" : "Add Payment Method"}
                description={editing ? "Update details for the payment method" : "Create a new payment method"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="method">Method Name</Label>
                        <Input id="method" name="method" defaultValue={editing?.method} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="definition">Description</Label>
                        <Input id="definition" name="definition" defaultValue={editing?.definition || ""} required />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CrudDialog>
        </>
    )
}
