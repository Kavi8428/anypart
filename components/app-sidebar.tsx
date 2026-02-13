"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { SidebarConfig } from "@/lib/sidebar-config"

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  config: SidebarConfig
  onLogout?: () => void
}

export function AppSidebar({ config, onLogout, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={config.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={config.navMain} />
        {config.projects && config.projects.length > 0 && (
          <NavProjects projects={config.projects} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={config.user} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
