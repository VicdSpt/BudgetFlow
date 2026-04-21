import { Outlet } from "react-router-dom"
import SideBarMenu from "./SideBarMenu"

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SideBarMenu />
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
