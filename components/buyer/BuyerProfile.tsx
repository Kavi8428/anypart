"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    Clock,
    LogOut,
    Edit,
    Zap,
    History,
    Lock,
    ExternalLink,
    CheckCircle2
} from "lucide-react"
import { buyerLogout } from "@/app/actions/buyer-auth"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"

interface BuyerProfileProps {
    buyer: {
        full_name: string;
        user_name: string;
        verified: number;
        created_at: Date | string;
        email: string;
        tel: number | string;
        address: string;
        cities?: { name: string } | null;
        disctricts?: { name: string } | null;
    } | null
    credits: number
    unlockedProducts: {
        id: number | string;
        product_id: number;
        created_at: Date | string;
        seller_products: {
            p_name_ref: { name: string } | null;
            v_model_ref: {
                name: string;
                v_brands: { name: string };
            };
            v_year_ref?: { year: number } | null;
            seller_details: { name: string };
        }
    }[]
    paymentHistory: {
        id: number | string;
        created_at: Date | string;
        buyer_amounts: { token_count: number; amount: number };
        payment_status: { status: string };
    }[]
    packages: {
        id: number;
        token_count: number;
        amount: number;
        validity_period: number;
    }[]
}

export function BuyerProfile({
    buyer,
    credits,
    unlockedProducts,
    paymentHistory,
    packages
}: BuyerProfileProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState("profile")

    useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab && ["profile", "credits", "history"].includes(tab) && tab !== activeTab) {
            const timer = setTimeout(() => setActiveTab(tab), 0)
            return () => clearTimeout(timer)
        }
    }, [searchParams, activeTab])

    const handleLogout = async () => {
        await buyerLogout()
        router.push("/buyer")
        router.refresh()
    }

    if (!buyer) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <ShieldCheck className="w-16 h-16 mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold">Profile Not Found</h2>
                <p>Unable to load your profile information.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {buyer.full_name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab("credits")}
                            className="gap-2 border-primary text-primary hover:bg-primary/5"
                        >
                            <Zap className="w-4 h-4" />
                            {credits} Credits
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="credits">Credits</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-12">
                            {/* Left Column: Profile Card */}
                            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                                <Card className="overflow-hidden border-none shadow-sm">
                                    <div className="bg-primary/5 h-20 w-full"></div>
                                    <div className="px-6 pb-6 text-center -mt-10">
                                        <div className="mx-auto w-20 h-20 rounded-full bg-white p-1 shadow-sm mb-3">
                                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                                {buyer.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">{buyer.full_name}</h2>
                                        <p className="text-xs text-gray-500 mb-3">@{buyer.user_name}</p>

                                        <div className="flex justify-center mb-4">
                                            {buyer.verified === 1 ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-gray-500">
                                                    Unverified
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="border-t pt-4 text-left space-y-2">
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <span>Since {new Date(buyer.created_at).getFullYear()}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <span className="truncate">{buyer.cities?.name || "No City"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 border-none shadow-sm bg-primary text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Zap className="w-5 h-5 opacity-80" />
                                        <span className="text-xs font-medium uppercase tracking-wider opacity-80">Credits</span>
                                    </div>
                                    <div className="text-3xl font-bold">{credits}</div>
                                    <p className="text-[10px] opacity-70 mt-1">Available for unlocking sellers</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full mt-4 h-8 text-xs font-bold"
                                        onClick={() => setActiveTab("credits")}
                                    >
                                        Buy More
                                    </Button>
                                </Card>
                            </div>

                            {/* Right Column: Personal Details */}
                            <div className="md:col-span-8 lg:col-span-9">
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                                            <CardDescription>Update your contact and billing details.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                                                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{buyer.full_name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</label>
                                                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">@{buyer.user_name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                                                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{buyer.email}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                                                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{buyer.tel}</span>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2 space-y-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                                                <div className="flex items-start gap-3 px-3 py-2.5 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {buyer.address}, {buyer.cities?.name}, {buyer.disctricts?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Credits Tab */}
                    <TabsContent value="credits" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-1 border-none shadow-sm h-fit">
                                <CardHeader>
                                    <CardTitle className="text-lg">Credit Balance</CardTitle>
                                    <CardDescription>View and manage your tokens.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-primary/5 p-6 rounded-xl text-center">
                                        <div className="text-4xl font-extrabold text-primary">{credits}</div>
                                        <p className="text-xs font-bold text-primary/60 uppercase mt-1">Available Credits</p>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-3 text-xs leading-relaxed text-gray-500">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Unlock any seller&apos;s contact details for 1 credit per product.</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-xs leading-relaxed text-gray-500">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Unlocked sellers are available to you permanently.</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button variant="outline" className="w-full text-xs font-bold" onClick={() => setActiveTab("history")}>
                                        <History className="w-3.5 h-3.5 mr-1.5" />
                                        View Usage History
                                    </Button>
                                </CardFooter>
                            </Card>

                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {packages.map((pkg) => (
                                        <Card key={pkg.id} className="relative overflow-hidden border border-gray-100 hover:border-primary/50 transition-all">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xl flex items-center justify-between">
                                                    <span>{pkg.token_count} Credits</span>
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                                                        {pkg.validity_period} Days
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    LKR {pkg.amount.toLocaleString()}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                                    {(pkg.amount / pkg.token_count).toFixed(2)} LKR / Credit
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    className="w-full font-bold bg-primary hover:bg-primary/90"
                                                    onClick={() => alert("Payment gateway integration coming soon!")}
                                                >
                                                    Top Up Now
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <div className="grid gap-6">
                            {/* Unlocked Products */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Unlocked Contacts</CardTitle>
                                        <CardDescription>Sellers you have unlocked previously.</CardDescription>
                                    </div>
                                    <Badge variant="outline">{unlockedProducts.length} Items</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {unlockedProducts.length > 0 ? (
                                            unlockedProducts.map((order) => (
                                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center shrink-0">
                                                            <Lock className="w-5 h-5 text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900">
                                                                {order.seller_products.p_name_ref?.name}
                                                            </h4>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                                                                {order.seller_products.v_model_ref.v_brands.name} {order.seller_products.v_model_ref.name} {order.seller_products.v_year_ref?.year}
                                                            </p>
                                                            <p className="text-xs text-primary font-medium mt-1">
                                                                Seller: {order.seller_products.seller_details.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                                        <div className="text-[10px] text-gray-400 font-medium">
                                                            Unlocked on {new Date(order.created_at).toLocaleDateString()}
                                                        </div>
                                                        <Link href={`/buyer/product_view/${order.product_id}`}>
                                                            <Button variant="secondary" size="sm" className="h-8 text-[10px] font-bold gap-1.5 uppercase">
                                                                View Details
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-400">
                                                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">You haven&apos;t unlocked any seller contacts yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment History */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Payment History</CardTitle>
                                    <CardDescription>Records of your credit purchases.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-gray-500 uppercase text-[10px] font-bold text-left">
                                                    <th className="pb-3 pr-4">Package</th>
                                                    <th className="pb-3 px-4">Amount</th>
                                                    <th className="pb-3 px-4">Date</th>
                                                    <th className="pb-3 pl-4 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {paymentHistory.length > 0 ? (
                                                    paymentHistory.map((payment) => (
                                                        <tr key={payment.id} className="text-gray-700">
                                                            <td className="py-4 pr-4 font-bold">{payment.buyer_amounts.token_count} Credits</td>
                                                            <td className="py-4 px-4 font-medium">LKR {payment.buyer_amounts.amount.toLocaleString()}</td>
                                                            <td className="py-4 px-4 text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</td>
                                                            <td className="py-4 pl-4 text-right">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[10px] ${payment.payment_status.status === 'succeeded' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                                                                >
                                                                    {payment.payment_status.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="py-12 text-center text-gray-400">
                                                            No payment records found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
