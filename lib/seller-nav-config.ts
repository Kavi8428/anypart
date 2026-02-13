import {
  Package,
  LayoutDashboard,
  List,
  Settings,
  Store,
  MessageSquare,
} from "lucide-react"
import type { SidebarConfig } from "./sidebar-config"

export const sellerNavConfig: SidebarConfig = {
  user: {
    name: "Seller",
    email: "seller@anypart.lk",
    avatar: "",
  },
  teams: [
    {
      name: "My Store",
      logo: Store,
      plan: "Seller",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/seller",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Overview", url: "/seller" },
      ],
    },
    {
      title: "Products",
      url: "/seller/products",
      icon: Package,
      items: [
        { title: "All Products", url: "/seller/products" },
      ],
    },
    {
      title: "Orders",
      url: "/seller/orders",
      icon: List,
      items: [
        { title: "All Orders", url: "/seller/orders" },
      ],
    },
    {
      title: "Chats",
      url: "/seller/chats",
      icon: MessageSquare,
      items: [
        { title: "Messages", url: "/seller/chats" },
      ],
    },
    {
      title: "Settings",
      url: "/seller/settings",
      icon: Settings,
      items: [
        { title: "Profile", url: "/seller/settings" },
      ],
    },
  ],
  projects: [],
}
