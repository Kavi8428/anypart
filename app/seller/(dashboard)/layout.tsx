import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SellerSidebar } from "@/components/dashboard/seller-sidebar"

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      sidebar={<SellerSidebar />}
      breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Dashboard" }]}
    >
      {children}
    </DashboardShell>
  )
}
