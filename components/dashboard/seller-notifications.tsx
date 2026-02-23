"use client"

import { useState, useEffect } from "react"
import { Bell, Package, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    getSellerNotifications,
    markOrderAsViewed,
    NotificationItem
} from "@/app/actions/seller-notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export function SellerNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function fetchNotifs() {
            const notifs = await getSellerNotifications()
            if (isMounted) setNotifications(notifs)
        }

        // Initial fetch
        fetchNotifs()

        // Poll every 15 seconds
        const intervalId = setInterval(fetchNotifs, 15000)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [])

    const handleNotificationClick = async (notif: NotificationItem) => {
        if (notif.type === "order") {
            // Optimistically remove
            setNotifications(prev => prev.filter(n => n.id !== notif.id))
            await markOrderAsViewed(notif.dbId)
            router.push(notif.link)
        } else {
            // Just redirect, it will be marked read when chat is opened
            router.push(notif.link)
        }
    }

    const unreadCount = notifications.length

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full focus-visible:ring-0">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border border-gray-100 shadow-xl overflow-hidden rounded-xl">
                <DropdownMenuLabel className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                        </span>
                    )}
                </DropdownMenuLabel>

                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center">
                            <Bell className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                            <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                    <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${notif.type === 'order' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                        {notif.type === "order" ? (
                                            <Package className="h-4 w-4" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900 leading-none">
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {notif.description}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 shadow-xs shadow-primary/30" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
