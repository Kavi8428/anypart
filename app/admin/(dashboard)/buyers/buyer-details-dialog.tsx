"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState, useTransition } from "react"
import { getBuyerFullDetails, toggleBuyerVerify, deleteBuyer } from "@/app/actions/admin"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Trash2, MapPin, Phone, Mail, Clock, ShoppingCart, Star, AlertTriangle, CreditCard, Shield } from "lucide-react"

export function BuyerDetailsDialog({
    buyerId,
    open,
    onOpenChange
}: {
    buyerId: number | null,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [data, setData] = useState<any>(null)
    const [isLoading, startTransition] = useTransition()

    useEffect(() => {
        if (open && buyerId) {
            startTransition(async () => {
                const details = await getBuyerFullDetails(buyerId)
                setData(details)
            })
        } else {
            setData(null)
        }
    }, [open, buyerId])

    if (!open || !buyerId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {data?.full_name || "Loading..."}
                            {data?.verified === 1 && <BadgeCheck className="text-blue-500 h-6 w-6" />}
                        </div>
                        {data && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startTransition(async () => {
                                        await toggleBuyerVerify(data.id, data.verified === 1 ? 1 : 0)
                                        const details = await getBuyerFullDetails(buyerId)
                                        setData(details)
                                    })}
                                >
                                    {data.verified === 1 ? "Revoke Verification" : "Verify Buyer"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => startTransition(async () => {
                                        if (confirm("Delete this buyer?")) {
                                            await deleteBuyer(data.id)
                                            onOpenChange(false)
                                        }
                                    })}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </div>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Buyer ID: {buyerId}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {isLoading || !data ? (
                        <div className="flex items-center justify-center h-48">
                            <span className="text-muted-foreground animate-pulse">Loading buyer details...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Key Information Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-white border rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Mail className="h-5 w-5" /></div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm text-muted-foreground">Email</div>
                                        <div className="font-medium truncate" title={data.email}>{data.email}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Phone className="h-5 w-5" /></div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Phone</div>
                                        <div className="font-medium">{data.tel}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><MapPin className="h-5 w-5" /></div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm text-muted-foreground">Location</div>
                                        <div className="font-medium truncate">{data.cities?.name || "N/A"}, {data.districts?.name || "N/A"}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Clock className="h-5 w-5" /></div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Registered On</div>
                                        <div className="font-medium">{format(new Date(data.created_at), "MMM d, yyyy")}</div>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="orders" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" /> Orders ({data.orders?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2" /> Payments ({data.buyer_payments?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="ratings"><Star className="h-4 w-4 mr-2" /> Ratings ({data.ratings?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="reports"><AlertTriangle className="h-4 w-4 mr-2" /> Reports ({data.reports?.length || 0})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="orders" className="bg-white border p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4">Order History</h3>
                                    {data.orders && data.orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.orders.map((o: any) => (
                                                <div key={o.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">Order #{o.id}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Product ID: {o.product_id}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm">{format(new Date(o.created_at), "MMM d, yyyy")}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No orders found.</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="payments" className="bg-white border p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                                    {data.buyer_payments && data.buyer_payments.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.buyer_payments.map((p: any) => (
                                                <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">Rs. {p.buyer_amounts?.amount?.toFixed(2) || "0.00"}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Tokens: {p.buyer_amounts?.token_count || 0}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={p.payment_status?.status?.toLowerCase().includes("pending") ? "secondary" : "default"}>
                                                            {p.payment_status?.status || "Unknown"}
                                                        </Badge>
                                                        <div className="text-xs text-muted-foreground mt-1">{format(new Date(p.created_at), "MMM d, yyyy")}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No payments found.</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="ratings" className="bg-white border p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4">Ratings Received</h3>
                                    {data.ratings && data.ratings.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.ratings.map((r: any) => (
                                                <div key={r.id} className="p-3 border rounded-lg space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center text-yellow-500">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-gray-300"}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</span>
                                                    </div>
                                                    {r.comment && <p className="text-sm border-t pt-2 mt-2">{r.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No ratings received.</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="reports" className="bg-white border p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center"><AlertTriangle className="h-5 w-5 mr-2" /> Reports Against Buyer</h3>
                                    {data.reports && data.reports.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.reports.map((r: any) => (
                                                <div key={r.id} className="p-3 border border-red-100 bg-red-50/50 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Badge variant="destructive">{r.status}</Badge>
                                                        <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</span>
                                                    </div>
                                                    <p className="text-sm font-medium">{r.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">Clean record. No reports.</div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
