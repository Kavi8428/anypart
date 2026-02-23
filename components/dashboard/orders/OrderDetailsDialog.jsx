"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { updateOrderStatus, getOrderStatuses } from "@/app/actions/orders";
const toast = (data) => alert(`${data.title}${data.description ? ': ' + data.description : ''}`);

export function OrderDetailsDialog({ order, isOpen, onOpenChange, onUpdate }) {
    const [statusId, setStatusId] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (order) {
            const currentStatus = order.order_tracking[0]?.status;
            setStatusId(currentStatus?.toString());
        }
    }, [order]);

    useEffect(() => {
        if (isOpen) {
            getOrderStatuses().then(setStatuses);
        }
    }, [isOpen]);

    if (!order) return null;

    const handleUpdateStatus = async () => {
        if (!statusId) return;

        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, parseInt(statusId));
            toast({
                title: "Status Updated",
                description: "Order status has been successfully updated.",
            });
            onUpdate?.();
            onOpenChange(false);
        } catch {
            toast({
                title: "Error",
                description: "Failed to update order status.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const latestTracking = order.order_tracking[0];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Order Details #{order.id}</DialogTitle>
                    <DialogDescription>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Buyer Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Buyer Information</h3>
                        <div className="text-sm">
                            <p className="font-medium">{order.buyer_details.full_name}</p>
                            <p>{order.buyer_details.email}</p>
                            <p>{order.buyer_details.tel}</p>
                            <p className="mt-1 text-muted-foreground">
                                {order.buyer_details.address},<br />
                                {order.buyer_details.cities.name}, {order.buyer_details.districts.name}
                            </p>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Product Information</h3>
                        <div className="text-sm">
                            <p className="font-medium text-blue-600">
                                {order.seller_products.p_name_ref.name}
                            </p>
                            <p className="text-muted-foreground">
                                {order.seller_products.v_model_ref.v_brands.name} {order.seller_products.v_model_ref.name} ({order.seller_products.v_year_ref?.year})
                            </p>
                            <p className="font-bold mt-1">LKR {order.seller_products.price?.toLocaleString()}</p>
                            <p className="mt-2 flex items-center gap-2">
                                Status: <OrderStatusBadge
                                    statusId={latestTracking?.status}
                                    statusLabel={latestTracking?.order_status.status}
                                />
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div className="py-4 space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Update Status</h3>
                    <div className="flex items-center gap-4">
                        <Select value={statusId} onValueChange={setStatusId}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleUpdateStatus} disabled={isUpdating || !statusId}>
                            {isUpdating ? "Updating..." : "Update Status"}
                        </Button>
                    </div>
                </div>

                {/* Tracking History */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tracking History</h3>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                        {order.order_tracking.map((track) => (
                            <div key={track.id} className="flex justify-between items-center text-xs border-b pb-2 last:border-0">
                                <span className="font-medium">{track.order_status.status}</span>
                                <span className="text-muted-foreground">
                                    {new Date(track.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
