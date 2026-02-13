"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { sellerNavConfig } from "@/lib/seller-nav-config"
import { sellerLogout } from "@/app/actions/seller-auth"

export function SellerSidebar() {
  return <AppSidebar config={sellerNavConfig} onLogout={sellerLogout} />
}
