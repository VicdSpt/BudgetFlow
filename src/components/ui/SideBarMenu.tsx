import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Target, Wallet, Settings } from "lucide-react"

const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/goals", label: "Objectifs", icon: Target },
    { to: "/budget", label: "Budget", icon: Wallet },
    { to: "/settings", label: "Paramètres", icon: Settings },
]

export default function SideBarMenu() {
    const location = useLocation()

    return (
        <nav className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
                <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
            </div>
            <div className="flex flex-col gap-1 px-3 py-4 flex-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
