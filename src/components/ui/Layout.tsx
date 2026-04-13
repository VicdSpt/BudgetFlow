import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBarMenu from "./SideBarMenu";
import { Menu, X } from 'lucide-react';

export default function Layout() {
    const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex h-screen">
        <SideBarMenu isOpen={isOpen} onClose={() => setIsOpen(false)}/>
        <div className="flex flex-col flex-1">
            <header className="p-4">
                <button className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24}/> : <Menu size={24}/>}</button>
            </header>
            <main className="flex-1 p-6">
                <Outlet/>
            </main>
        </div>
    </div>
  )
}