import { Link, useLocation } from "react-router-dom"
import { LogIn, LogOut } from "lucide-react"
import { navItems } from "./navItems"
import { useAuth } from "../../context/AuthContext"

export default function SideBarMenu() {
    const location = useLocation()
    const { session, signOut } = useAuth()

    return (
        <nav className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 hidden md:flex flex-col">
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
            <div className="px-3 py-4 border-t border-slate-100">
                {session ? (
                    <div className="flex items-center justify-between gap-2 px-3">
                        <span className="text-xs text-slate-500 truncate" title={session.user.email}>
                            {session.user.email}
                        </span>
                        <button
                            onClick={signOut}
                            title="Se déconnecter"
                            className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === "/auth"
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                    >
                        <LogIn size={18} />
                        Se connecter
                    </Link>
                )}
            </div>
        </nav>
    )
}
