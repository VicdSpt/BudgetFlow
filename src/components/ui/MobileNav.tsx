import { Link, useLocation } from "react-router-dom"
import { LogIn, LogOut } from "lucide-react"
import { navItems } from "./navItems"
import { useAuth } from "../../context/AuthContext"

export default function MobileNav() {
    const location = useLocation()
    const { session, signOut } = useAuth()

    return (
        <>
            {/* Top bar : branding + auth */}
            <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
                {session ? (
                    <button onClick={signOut} title="Se déconnecter" className="text-slate-400 hover:text-rose-500">
                        <LogOut size={18} />
                    </button>
                ) : (
                    <Link to="/auth" title="Se connecter" className="text-slate-400 hover:text-emerald-600">
                        <LogIn size={18} />
                    </Link>
                )}
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
