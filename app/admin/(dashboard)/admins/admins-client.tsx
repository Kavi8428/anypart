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
import { createAdmin, updateAdmin, deleteAdmin } from "@/app/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { CrudDialog } from "@/components/admin/crud-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function AdminsClient({ data, roles, departments }: { data: any[], roles: any[], departments: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "full_name",
            header: "Full Name",
        },
        {
            accessorKey: "user_name",
            header: "Username",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "app_admin_roles.role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.app_admin_roles?.role || "—"}</Badge>
            )
        },
        {
            accessorKey: "app_departments.name",
            header: "Department",
            cell: ({ row }) => row.original.app_departments?.name || "—"
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
                                    if (confirm("Are you sure you want to delete this admin account?")) {
                                        await deleteAdmin(item.id)
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
                await updateAdmin(editing.id, formData)
            } else {
                await createAdmin(formData)
            }
            setOpen(false)
            setEditing(null)
        })
    }

    return (
        <>
            <PageHeader
                title="Admin Accounts"
                description="Manage administrative accounts, their roles, and departments."
                action={
                    <Button onClick={() => { setEditing(null); setOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Admin
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                searchKey="full_name"
            />

            <CrudDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v)
                    if (!v) setEditing(null)
                }}
                title={editing ? "Edit Admin Account" : "Add Admin Account"}
                description={editing ? "Update details for the admin account" : "Create a new admin account"}
            >
                <form action={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" defaultValue={editing?.full_name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user_name">Username</Label>
                            <Input id="user_name" name="user_name" defaultValue={editing?.user_name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={editing?.email} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password {editing && "(Leave blank to keep current)"}</Label>
                            <Input id="password" name="password" type="password" required={!editing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                name="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={editing?.role || ""}
                            >
                                <option value="">Select a role...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.role}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <select
                                id="department"
                                name="department"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={editing?.department || ""}
                            >
                                <option value="">Select a department...</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
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
