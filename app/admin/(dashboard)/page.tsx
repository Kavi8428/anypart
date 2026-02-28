import { getAdminStats } from "@/app/actions/admin"
import { StatCard } from "@/components/admin/stat-card"
import {
  Users,
  Building2,
  ShoppingCart,
  ShoppingBag,
  AlertTriangle,
  CreditCard
} from "lucide-react"

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Here is the overview of the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Buyers"
          value={stats.totalBuyers}
          icon={Users}
          description="Registered buyers"
        />
        <StatCard
          title="Total Sellers"
          value={stats.totalSellers}
          icon={Building2}
          description="Registered sellers"
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          icon={ShoppingCart}
          description="Products across all sellers"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          description="Unlocked seller details"
        />
        <StatCard
          title="Total Revenue"
          value={`Rs ${stats.revenue.toLocaleString()}`}
          icon={CreditCard}
          description="Total seller ad revenue"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={AlertTriangle}
          description="Needs admin review"
        />
      </div>
    </div>
  )
}
