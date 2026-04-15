import { Link, useLocation } from "react-router-dom"
import { X, LayoutDashboard, Target, Wallet, Settings } from "lucide-react"

interface SideBarMenuProps {
    isOpen: boolean
    onClose: () => void
}

const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/goals", label: "Objectifs", icon: Target },
    { to: "/budget", label: "Budget", icon: Wallet },
    { to: "/settings", label: "Paramètres", icon: Settings },
]

export default function SideBarMenu({ isOpen, onClose }: SideBarMenuProps) {
    const location = useLocation()

    return (
        <nav className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-sm transition-transform duration-300 z-40 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col gap-1 px-3 py-4 flex-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to
                    return (
                        <Link
                            key={to}
                            to={to}
                            onClick={onClose}
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
