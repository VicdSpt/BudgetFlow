import { Outlet } from "react-router-dom"
import { useState } from "react"
import SideBarMenu from "./SideBarMenu"
import { Menu } from "lucide-react"

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SideBarMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* overlay sombre quand sidebar ouverte */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <span className="text-slate-400 text-sm">BudgetFlow</span>
        </header>

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
