import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { navItems } from "./navItems"

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    return (
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
                <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    className="p-1 text-slate-600 hover:text-slate-900"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {isOpen && (
                <nav className="flex flex-col gap-1 px-3 pb-3 border-t border-slate-50">
                    {navItems.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setIsOpen(false)}
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
                </nav>
            )}
        </header>
    )
}
