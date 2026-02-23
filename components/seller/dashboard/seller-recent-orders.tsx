"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/dashboard/orders/OrderStatusBadge"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface RecentOrdersProps {
    orders: Array<{
        id: number
        buyerName: string
        productName: string
        status: string
        statusId: number
        createdAt: Date
    }>
}

export function SellerRecentOrders({ orders }: RecentOrdersProps) {
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Recent Orders</CardTitle>
                </div>
                <Link
                    href="/seller/orders"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                    View All <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No orders found yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">#{order.id} — {order.productName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        by {order.buyerName} • {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <OrderStatusBadge statusId={order.statusId} statusLabel={order.status} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
