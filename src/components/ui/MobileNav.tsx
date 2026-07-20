import { Link, useLocation } from "react-router-dom"
import { navItems } from "./navItems"

export default function MobileNav() {
    const location = useLocation()

    return (
        <>
            {/* Top bar : juste le branding */}
            <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
                <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
            </header>

            {/* Bottom tab bar : navigation au pouce */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around">
                    {navItems.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex flex-col items-center gap-0.5 px-2 py-2 min-w-0 flex-1 transition-colors ${isActive
                                    ? "text-emerald-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-medium truncate">{label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
