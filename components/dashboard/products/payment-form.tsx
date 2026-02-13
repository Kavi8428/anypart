"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, ShieldCheck, Loader2, FlaskConical } from "lucide-react"
import { generatePayHereParams, mockPaymentSuccess } from "@/app/actions/payments"
import Script from "next/script"

interface PaymentFormProps {
    amount: number
    onSuccess: (paymentId: string) => void
    disabled?: boolean
}

declare const payhere: {
    onCompleted: (orderId: string) => void;
    onDismissed: () => void;
    onError: (error: string) => void;
    startPayment: (payment: Record<string, unknown>) => void;
};

export function PaymentForm({ amount, onSuccess, disabled }: PaymentFormProps) {
    const [loading, setLoading] = React.useState(false)

    const handlePayment = async () => {
        setLoading(true)
        try {
            const params = await generatePayHereParams(amount)

            // PayHere Payment Object
            const payment: Record<string, unknown> = {
                ...params,
                delivery_address: params.address,
                delivery_city: params.city,
                delivery_country: params.country,
            }

            // Important: PayHere handles its own UI. 
            // We need to listen to its callback functions.

            payhere.onCompleted = function onCompleted(orderId: string) {
                console.log("Payment completed. OrderID:" + orderId)
                onSuccess(orderId)
                setLoading(false)
            }

            payhere.onDismissed = function onDismissed() {
                console.log("Payment dismissed")
                setLoading(false)
            }

            payhere.onError = function onError(error: string) {
                alert("Payment Error: " + error)
                setLoading(false)
            }

            payhere.startPayment(payment)
        } catch (error) {
            console.error(error)
            alert("Failed to initialize payment")
            setLoading(false)
        }
    }

    const handleMockSuccess = async () => {
        setLoading(true)
        try {
            const params = await generatePayHereParams(amount)
            await mockPaymentSuccess(params.order_id)
            onSuccess(params.order_id)
        } catch (error) {
            console.error(error)
            alert("Mock payment failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Script
                src="https://www.payhere.lk/lib/payhere.js"
                strategy="lazyOnload"
            />

            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Featured Ad Payment</span>
                    </div>
                    <span className="text-xl font-bold">LKR {amount.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
                        <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p>
                            Your payment is handled securely by **PayHere**. We do not store any credit card information on our servers.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handlePayment}
                        disabled={loading || disabled}
                        className="w-full h-12 text-lg font-bold bg-[#FF6200] hover:bg-[#e65900]"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            "Pay Now via PayHere"
                        )}
                    </Button>

                    <div className="flex justify-center items-center gap-2 pt-2 grayscale opacity-60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://www.payhere.lk/downloads/images/payhere_square_banner.png" alt="PayHere" width={120} height={40} className="h-10 w-auto" />
                    </div>

                    {/* Development Only Mock Button */}
                    <div className="mt-8 pt-6 border-t border-dashed">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center mb-3">Development Only</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleMockSuccess}
                            disabled={loading || disabled}
                            className="w-full border-primary/30 text-primary hover:bg-primary/5 group"
                        >
                            <FlaskConical className="mr-2 h-4 w-4 text-primary group-hover:animate-bounce" />
                            Mock Success (Simulate Paid)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
