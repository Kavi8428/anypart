"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Zap, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

interface ProductOverviewProps {
    productSplit: {
        featured: number
        regular: number
    }
}

export function SellerProductOverview({ productSplit }: ProductOverviewProps) {
    const total = productSplit.featured + productSplit.regular
    const featuredPercentage = total > 0 ? (productSplit.featured / total) * 100 : 0
    const regularPercentage = total > 0 ? (productSplit.regular / total) * 100 : 0

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Product Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Featured
                        </span>
                        <span className="font-bold">{productSplit.featured}</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${featuredPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-yellow-400"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 text-blue-500" /> Regular
                        </span>
                        <span className="font-bold">{productSplit.regular}</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${regularPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                    Featured products get 3x more views on average.
                </div>
            </CardContent>
        </Card>
    )
}
