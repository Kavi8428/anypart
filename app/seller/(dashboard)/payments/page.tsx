"use client";

import { useState, useEffect, useCallback } from "react";
import { getSellerPayments } from "@/app/actions/payments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    Eye,
    CreditCard,
    Calendar,
    Hash,
    ArrowUpRight,
    Package,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function SellerPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getSellerPayments(page, 15);
            setPayments(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleViewDetails = (payment: any) => {
        setSelectedPayment(payment);
        setIsDetailsOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
            case 'pending':
                return 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200';
            case 'failed':
            case 'cancelled':
                return 'bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 p-6 w-full mx-auto max-w-[1400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Payments & Billing
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Detailed transaction history and promotion billings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Card className="px-4 py-2 flex items-center gap-3 border-none shadow-sm bg-primary/5">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Total Transactions</p>
                            <p className="font-bold text-lg leading-none">{meta?.total || 0}</p>
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="border-none shadow-xl overflow-hidden bg-white/60 backdrop-blur-md">
                <CardHeader className="bg-white/40 border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Hash className="w-5 h-5 text-primary" />
                                Recent Transactions
                            </CardTitle>
                            <CardDescription>Click on a row to view full details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[100px] font-bold">Ref ID</TableHead>
                                        <TableHead className="font-bold">Gateway Order ID</TableHead>
                                        <TableHead className="font-bold">Date & Time</TableHead>
                                        <TableHead className="font-bold">Method</TableHead>
                                        <TableHead className="font-bold text-center">Amount</TableHead>
                                        <TableHead className="font-bold text-center">Status</TableHead>
                                        <TableHead className="text-right font-bold pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle className="w-8 h-8 opacity-20" />
                                                    <p>No payment records found in your account.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map((payment) => (
                                            <TableRow
                                                key={payment.id}
                                                className="group cursor-pointer hover:bg-primary/5 transition-all"
                                                onClick={() => handleViewDetails(payment)}
                                            >
                                                <TableCell className="font-bold text-muted-foreground">#{payment.id}</TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded font-medium text-slate-600">
                                                        {payment.order_id}
                                                    </code>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(payment.created_at), "MMM d, yyyy")}
                                                        <span className="text-[10px] bg-muted px-1 rounded">
                                                            {format(new Date(payment.created_at), "h:mm a")}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-semibold px-2 py-0">
                                                        {payment.method || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-primary">
                                                        {payment.currency} {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`${getStatusColor(payment.status)} font-bold px-3 py-1 shadow-sm`} variant="outline">
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-6">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPage(p => p - 1);
                        }}
                        className="w-28 border-primary/20 hover:bg-primary/5 text-primary font-semibold"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-6 py-2 text-sm font-bold bg-white rounded-full border shadow-sm mx-4 text-muted-foreground">
                        Page <span className="mx-2 text-primary">{page}</span> of <span className="ml-2 text-slate-400">{meta.totalPages}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === meta.totalPages}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPage(p => p + 1);
                        }}
                        className="w-28 border-primary/20 hover:bg-primary/5 text-primary font-semibold"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Advanced View Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-none shadow-2xl">
                    {selectedPayment && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between pr-8">
                                    <div>
                                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                            Transaction Details
                                            <Badge className={getStatusColor(selectedPayment.status)} variant="outline">
                                                {selectedPayment.status}
                                            </Badge>
                                        </DialogTitle>
                                        <DialogDescription className="text-lg">
                                            Reference #{selectedPayment.id} — {format(new Date(selectedPayment.created_at), "MMMM d, yyyy p")}
                                        </DialogDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Amount Paid</p>
                                        <p className="text-3xl font-black text-primary">
                                            {selectedPayment.currency} {selectedPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    <div className="bg-muted/40 p-4 rounded-xl space-y-3">
                                        <h3 className="font-bold flex items-center gap-2 text-primary">
                                            <CreditCard className="w-4 h-4" />
                                            Payment Info
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <span className="text-muted-foreground">Gateway ID:</span>
                                            <span className="font-mono text-xs">{selectedPayment.order_id}</span>

                                            <span className="text-muted-foreground">Method:</span>
                                            <span className="font-semibold">{selectedPayment.method}</span>

                                            <span className="text-muted-foreground">Last Updated:</span>
                                            <span>{format(new Date(selectedPayment.updated_at), "MMM d, yyyy h:mm a")}</span>

                                            {selectedPayment.payhere_amount && (
                                                <>
                                                    <span className="text-muted-foreground">Gateway Amount:</span>
                                                    <span className="font-bold text-emerald-600">LKR {selectedPayment.payhere_amount.toFixed(2)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <p className="text-xs text-primary/80 leading-relaxed italic">
                                            This transaction represents a fee or payment processed via the secure gateway. If you have questions about this billing, please contact our support team with the Gateway Order ID.
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column: Products Section */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold flex items-center gap-2 border-b pb-2">
                                            <Package className="w-4 h-4 text-primary" />
                                            Related Products
                                        </h3>
                                        {selectedPayment.products?.length > 0 ? (
                                            selectedPayment.products.map((product: any) => (
                                                <div key={product.id} className="flex gap-4 p-3 border rounded-xl bg-white hover:border-primary/40 transition-colors">
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0">
                                                        <Image
                                                            src={product.image || "/placeholder-image.png"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between py-1">
                                                        <div>
                                                            <h4 className="font-bold leading-tight">{product.name}</h4>
                                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="font-bold text-primary">LKR {product.price?.toLocaleString()}</span>
                                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" asChild>
                                                                <a href={`/seller/products?id=${product.id}`} className="flex items-center gap-1">
                                                                    View <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl italic text-sm">
                                                No specific products linked to this transaction.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
