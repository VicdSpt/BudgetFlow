import { Outlet } from "react-router-dom"
import SideBarMenu from "./SideBarMenu"
import MobileNav from "./MobileNav"

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <MobileNav />
      <SideBarMenu />
      {/* pb-20 : réserve la place de la bottom bar mobile (fixed) */}
      <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6 w-full">
        <Outlet />
      </main>
    </div>
  )
}
