import {
  LayoutDashboard,
  Tag,
  Box,
  Settings,
  Shield,
  Building2,
  Users,
} from "lucide-react"
import type { SidebarConfig } from "./sidebar-config"

export const adminNavConfig: SidebarConfig = {
  user: {
    name: "Admin",
    email: "admin@anypart.lk",
    avatar: "",
  },
  teams: [
    {
      name: "AnyPart.lk",
      logo: Shield,
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Overview", url: "/admin" },
      ],
    },
    {
      title: "Buyers",
      url: "/admin/buyers",
      icon: Users,
      items: [
        { title: "All Buyers", url: "/admin/buyers" },
      ],
    },
    {
      title: "Sellers",
      url: "/admin/sellers",
      icon: Building2,
      items: [
        { title: "All Sellers", url: "/admin/sellers" },
      ],
    },
    {
      title: "Product Brands",
      url: "/admin/p-brands",
      icon: Tag,
      items: [
        { title: "All Product Brands", url: "/admin/p-brands" },
      ],
    },
    {
      title: "Product Models",
      url: "/admin/p-models",
      icon: Box,
      items: [
        { title: "All Product Models", url: "/admin/p-models" },
      ],
    },
    {
      title: "Vehicle Brands",
      url: "/admin/v-brands",
      icon: Tag,
      items: [
        { title: "All Vehicle Brands", url: "/admin/v-brands" },
      ],
    },
    {
      title: "Vehicle Models",
      url: "/admin/v-models",
      icon: Box,
      items: [
        { title: "All Vehicle Models", url: "/admin/v-models" },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      items: [
        { title: "General", url: "/admin/settings" },
      ],
    },
  ],
  projects: [],
}
