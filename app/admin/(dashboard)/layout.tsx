import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { getAdminSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <DashboardShell
      sidebar={<AdminSidebar />}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
    >
      {children}
    </DashboardShell>
  )
}
