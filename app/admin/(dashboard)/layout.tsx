import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      sidebar={<AdminSidebar />}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
    >
      {children}
    </DashboardShell>
  )
}
