import {
  LayoutDashboard,
  Tag,
  Box,
  Settings,
  Shield,
  Building2,
  Users,
  ShoppingCart,
  CreditCard,
  MapPin,
  AlertTriangle,
  Star,
  Wallet,
  Percent,
  List,
  Tags,
  UserCog,
  Briefcase
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
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/admin" },
      ],
    },
    {
      title: "Users",
      url: "/admin/buyers",
      icon: Users,
      items: [
        { title: "Buyers", url: "/admin/buyers" },
        { title: "Sellers", url: "/admin/sellers" },
      ],
    },
    {
      title: "Commerce",
      url: "/admin/products",
      icon: ShoppingCart,
      items: [
        { title: "Products", url: "/admin/products" },
        { title: "Orders", url: "/admin/orders" },
      ],
    },
    {
      title: "Payments",
      url: "/admin/payments/buyer",
      icon: CreditCard,
      items: [
        { title: "Buyer Payments", url: "/admin/payments/buyer" },
        { title: "Seller Payments", url: "/admin/payments/seller" },
        { title: "Token Packages", url: "/admin/token-packages" },
        { title: "Promotions", url: "/admin/promotions" },
      ],
    },
    {
      title: "Vehicle Data",
      url: "/admin/v-brands",
      icon: Box,
      items: [
        { title: "Vehicle Brands", url: "/admin/v-brands" },
        { title: "Vehicle Models", url: "/admin/v-models" },
      ],
    },
    {
      title: "Part Data",
      url: "/admin/p-brands",
      icon: Tag,
      items: [
        { title: "Part Brands", url: "/admin/p-brands" },
        { title: "Part Names", url: "/admin/p-models" },
      ],
    },
    {
      title: "Metadata",
      url: "/admin/hash-tags",
      icon: Tags,
      items: [
        { title: "Hash Tags", url: "/admin/hash-tags" },
        { title: "Conditions", url: "/admin/conditions" },
        { title: "Seller Types", url: "/admin/seller-types" },
        { title: "Payment Statuses", url: "/admin/payment-status" },
        { title: "Payment Methods", url: "/admin/payment-methods" },
        { title: "Districts", url: "/admin/districts" },
        { title: "Cities", url: "/admin/cities" },
      ],
    },
    {
      title: "Moderation",
      url: "/admin/reports",
      icon: AlertTriangle,
      items: [
        { title: "User Reports", url: "/admin/reports" },
        { title: "User Ratings", url: "/admin/ratings" },
      ],
    },
    {
      title: "System",
      url: "/admin/admins",
      icon: UserCog,
      items: [
        { title: "Admin Accounts", url: "/admin/admins" },
        { title: "Roles & Permissions", url: "/admin/roles" },
        { title: "Departments", url: "/admin/departments" },
        { title: "Settings", url: "/admin/settings" },
      ],
    },
  ],
  projects: [],
}
