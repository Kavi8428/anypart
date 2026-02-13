"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, MessageCircle, Home, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Category", icon: LayoutGrid, href: "/buyer/categories" },
    { label: "Chats", icon: MessageCircle, href: "/buyer/chat" },
    { label: "Home", icon: Home, href: "/buyer" },
    { label: "Cart", icon: ShoppingCart, href: "/buyer/cart" },
    { label: "Profile", icon: User, href: "/buyer/profile" },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-fit">
            <nav className="flex items-center justify-around sm:justify-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-full shadow-2xl border border-white/20">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const isHome = item.label === "Home"

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 sm:gap-1 min-w-[56px] sm:min-w-[64px] transition-all duration-300",
                                isActive && !isHome ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all duration-300",
                                    isHome ? (isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-500") : ""
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isHome && isActive ? "scale-105 sm:scale-110" : "")} />
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-tight sm:tracking-wider">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
