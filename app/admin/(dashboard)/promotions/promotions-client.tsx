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
import { MoreHorizontal, Plus, Pencil, Trash2, CalendarDays } from "lucide-react"
import { useTransition, useState } from "react"
import { createPromotion, updatePromotion, deletePromotion } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function PromotionsClient({ data }: { data: any[] }) {
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
            header: "Promo Name",
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <span className="truncate max-w-[200px] inline-block">{row.original.description || "—"}</span>
        },
        {
            accessorKey: "start_at",
            header: "Start Date",
            cell: ({ row }) => row.original.start_at ? format(new Date(row.original.start_at), "MMM d, yyyy") : "—",
        },
        {
            accessorKey: "end_at",
            header: "End Date",
            cell: ({ row }) => {
                const isExpired = row.original.end_at && new Date(row.original.end_at) < new Date()
                return row.original.end_at ? (
                    <div className="flex items-center gap-2">
                        {format(new Date(row.original.end_at), "MMM d, yyyy")}
                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                    </div>
                ) : "—"
            }
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
                                onClick={() => alert("Promo Price Tiers editing is not yet implemented.")}
                            >
                                <CalendarDays className="mr-2 h-4 w-4" /> Manage Tiers
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => startTransition(async () => {
                                    if (confirm("Are you sure you want to delete this promotion?")) {
                                        await deletePromotion(item.id)
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
                await updatePromotion(editing.id, formData)
            } else {
                await createPromotion(formData)
            }
            setOpen(false)
            setEditing(null)
        })
    }

    return (
        <>
            <PageHeader
                title="Promotions"
                description="Manage active seasonal or time-limited promotions."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Promo
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
                title={editing ? "Edit Promotion" : "Add Promotion"}
                description={editing ? "Update details for the promotion" : "Create a new promotion event"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Promo Name</Label>
                        <Input id="name" name="name" defaultValue={editing?.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" name="description" defaultValue={editing?.description || ""} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_at">Start Date (Optional)</Label>
                            <Input id="start_at" name="start_at" type="date" defaultValue={editing?.start_at ? new Date(editing.start_at).toISOString().split('T')[0] : ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_at">End Date (Optional)</Label>
                            <Input id="end_at" name="end_at" type="date" defaultValue={editing?.end_at ? new Date(editing.end_at).toISOString().split('T')[0] : ""} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </form>
            </CrudDialog>
        </>
    )
}
