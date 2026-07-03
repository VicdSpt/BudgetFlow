import { LayoutDashboard, Target, Wallet, Receipt, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
    to: string
    label: string
    icon: LucideIcon
}

export const navItems: NavItem[] = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/goals", label: "Objectifs", icon: Target },
    { to: "/budget", label: "Budget", icon: Wallet },
    { to: "/transactions", label: "Dépenses", icon: Receipt },
    { to: "/settings", label: "Paramètres", icon: Settings },
]
