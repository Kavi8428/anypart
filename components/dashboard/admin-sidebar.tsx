"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { adminNavConfig } from "@/lib/admin-nav-config"
import { adminLogout } from "@/app/actions/admin-auth"
import { useRouter } from "next/navigation"

export function AdminSidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin/login")
  }

  return (
    <AppSidebar
      config={{
        ...adminNavConfig,
        user: {
          name: "Admin User",
          email: "admin@anypart.lk",
          avatar: "",
        }
      }}
      onLogout={handleLogout}
    />
  )
}
