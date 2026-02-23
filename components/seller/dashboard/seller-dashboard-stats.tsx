"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, MessageSquare, Star } from "lucide-react"
import { motion } from "framer-motion"

interface StatsProps {
    stats: {
        totalProducts: number
        activeOrders: number
        unreadMessages: number
        averageRating: number
        ratingCount: number
    }
}

export function SellerDashboardStats({ stats }: StatsProps) {
    const cards = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: Package,
            description: "Active listings",
            color: "text-blue-600",
            bgColor: "bg-blue-100/50",
        },
        {
            title: "Active Orders",
            value: stats.activeOrders,
            icon: ShoppingCart,
            description: "Total orders received",
            color: "text-orange-600",
            bgColor: "bg-orange-100/50",
        },
        {
            title: "Unread Messages",
            value: stats.unreadMessages,
            icon: MessageSquare,
            description: "New from buyers",
            color: "text-green-600",
            bgColor: "bg-green-100/50",
        },
        {
            title: "Average Rating",
            value: stats.averageRating.toFixed(1),
            icon: Star,
            description: `From ${stats.ratingCount} reviews`,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100/50",
        },
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
            {cards.map((card, idx) => (
                <motion.div key={idx} variants={item}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {card.title}
                            </CardTitle>
                            <div className={`rounded-full p-2 ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}
