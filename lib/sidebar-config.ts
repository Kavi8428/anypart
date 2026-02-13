import type { LucideIcon } from "lucide-react"

export type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

export type NavProject = {
  name: string
  url: string
  icon: LucideIcon
}

export type Team = {
  name: string
  logo: LucideIcon
  plan: string
}

export type SidebarUser = {
  name: string
  email: string
  avatar: string
}

export type SidebarConfig = {
  user: SidebarUser
  teams: Team[]
  navMain: NavMainItem[]
  projects?: NavProject[]
}
