"use client";

import { useState, useEffect, useCallback } from "react";
import { getSellerOrders } from "@/app/actions/orders";
import { OrderTable } from "@/components/dashboard/orders/OrderTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSellerOrders(page);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchQuery) ||
    order.buyer_details.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller_products.p_name_ref.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 w-full mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Intro */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage your incoming orders and track their delivery status.
          </p>
        </div>

        {/* Stats Card */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white flex items-center justify-between shadow-lg shadow-blue-200">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-4xl font-bold">{meta?.total || 0}</p>
          </div>
          <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
        </div> */}
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm mt-6">
        <CardHeader className="bg-white/80 border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Order Management</CardTitle>
              <CardDescription>Search and filter your orders</CardDescription>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, Buyer, or Product..."
                className="pl-9 bg-white border-slate-200 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4 bg-white/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <OrderTable orders={filteredOrders} onUpdate={fetchOrders} />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-medium bg-white rounded-md border shadow-sm">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === meta.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
