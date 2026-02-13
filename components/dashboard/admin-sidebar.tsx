"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { adminNavConfig } from "@/lib/admin-nav-config"

export function AdminSidebar() {
  return <AppSidebar config={adminNavConfig} />
}
