import { getSellerSession } from "@/lib/auth";
import { getSellerDashboardData } from "@/app/actions/seller-dashboard";
import { SellerDashboardStats } from "@/components/seller/dashboard/seller-dashboard-stats";
import { SellerRecentOrders } from "@/components/seller/dashboard/seller-recent-orders";
import { SellerProductOverview } from "@/components/seller/dashboard/seller-product-overview";
import { SellerQuickActions } from "@/components/seller/dashboard/seller-quick-actions";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { Button } from "@base-ui/react";
import Link from "next/link";

export default async function SellerDashboardPage() {
  const session = await getSellerSession();
  const data = await getSellerDashboardData();

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {session?.seller_details?.name || "Seller"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add product button */}
          <Link href="/seller/products?action=add">
            <Button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </Link>
          <div className="bg-card px-4 py-2 rounded-lg border shadow-sm text-sm font-medium">

            {format(new Date(), "eeee, MMMM do, yyyy")}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <SellerDashboardStats stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table (2/3 width) */}
        <div className="lg:col-span-2">
          <SellerRecentOrders orders={data.recentOrders} />
        </div>

        {/* Product Overview (1/3 width) */}
        <div className="lg:col-span-1">
          <SellerProductOverview productSplit={data.productSplit} />
        </div>
      </div>

      {/* Quick Actions Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
        <SellerQuickActions />
      </div>
    </div>
  );
}
