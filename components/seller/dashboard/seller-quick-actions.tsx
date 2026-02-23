"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, List, MessageSquare, UserCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function SellerQuickActions() {
    const actions = [
        {
            title: "Add Product",
            href: "/seller/products",
            icon: PlusCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "My Orders",
            href: "/seller/orders",
            icon: List,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Chat Messages",
            href: "/seller/chats",
            icon: MessageSquare,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Store Profile",
            href: "/seller/settings/profile",
            icon: UserCircle,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-full"
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group">
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                <div className={`p-3 rounded-2xl ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                                    <action.icon className={`h-6 w-6 ${action.color}`} />
                                </div>
                                <span className="font-semibold text-sm text-center">{action.title}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Link>
            ))}
        </div>
    )
}
