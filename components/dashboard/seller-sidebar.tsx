"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { sellerNavConfig } from "@/lib/seller-nav-config"
import { sellerLogout } from "@/app/actions/seller-auth"

export type SellerSidebarProps = {
  seller?: {
    name: string;
    user_name: string;
    logo_url?: string | null;
  }
}

export function SellerSidebar({ seller }: SellerSidebarProps) {
  // Merge seller session data into the base config
  const dynamicConfig = {
    ...sellerNavConfig,
    user: seller ? {
      name: seller.name,
      email: seller.user_name,
      avatar: seller.logo_url || "",
    } : sellerNavConfig.user,
    teams: seller ? [
      {
        name: seller.name,
        logo: sellerNavConfig.teams[0].logo,
        plan: "Seller Account",
      }
    ] : sellerNavConfig.teams
  }

  return <AppSidebar config={dynamicConfig} onLogout={sellerLogout} />
}
