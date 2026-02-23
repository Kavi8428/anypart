import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SellerSidebar } from "@/components/dashboard/seller-sidebar"
import { getSellerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SellerNotifications } from "@/components/dashboard/seller-notifications"

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSellerSession();
  if (!session) {
    redirect('/seller/login');
  }

  return (
    <DashboardShell
      sidebar={<SellerSidebar seller={session.seller_details} />}
      breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Dashboard" }]}
      headerRight={<SellerNotifications />}
    >
      {children}
    </DashboardShell>
  )
}
