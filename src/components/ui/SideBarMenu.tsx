import { Link } from "react-router-dom";
import { X } from 'lucide-react';

interface SideBarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideBarMenu({ isOpen, onClose }: SideBarMenuProps) {

    return (
        <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
            <Link to="/">Home</Link>
            <Link to="/goals">Goals</Link>
            <Link to="/budget">Budget</Link>
            <Link to="/settings">Setting</Link>

            <button className="cursor-pointer" onClick={onClose}><X size={24} /></button>
            
        </nav>
    )
}