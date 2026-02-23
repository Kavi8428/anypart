"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { getOrderDetails } from "@/app/actions/orders";
import { Eye } from "lucide-react";

export function OrderTable({ orders, onUpdate }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const handleViewDetails = async (orderId) => {
        setIsLoadingDetails(true);
        try {
            const details = await getOrderDetails(orderId);
            setSelectedOrder(details);
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Failed to load order details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <>
            <div className="rounded-md border bg-white/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-slate-50/80">
                            <TableHead className="w-[100px] font-semibold text-slate-700">Order ID</TableHead>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700">Buyer Details</TableHead>
                            <TableHead className="font-semibold text-slate-700">Product Info</TableHead>
                            <TableHead className="font-semibold text-slate-700">Price</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground bg-white/50">
                                    No orders found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const latestTracking = order.order_tracking[0];
                                return (
                                    <TableRow key={order.id} className="group hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0 bg-white/40">
                                        <TableCell className="font-bold text-slate-700">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-slate-800">{order.buyer_details.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{order.buyer_details.tel}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col max-w-[250px] gap-0.5">
                                                <span className="truncate text-sm font-medium text-slate-800">
                                                    {order.seller_products.p_name_ref.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {order.seller_products.v_model_ref.v_brands.name} {order.seller_products.v_model_ref.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-700 whitespace-nowrap">
                                            <span className="text-xs text-muted-foreground font-normal mr-1">LKR</span>
                                            {order.seller_products.price?.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="transform transition-transform group-hover:scale-105 origin-left">
                                                <OrderStatusBadge
                                                    statusId={latestTracking?.status}
                                                    statusLabel={latestTracking?.order_status.status}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="hover:bg-blue-100 hover:text-blue-700 transition-colors border shadow-sm"
                                                onClick={() => handleViewDetails(order.id)}
                                                disabled={isLoadingDetails}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-2" />
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <OrderDetailsDialog
                order={selectedOrder}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onUpdate={onUpdate}
            />
        </>
    );
}
