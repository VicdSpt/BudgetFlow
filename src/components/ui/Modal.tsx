import ReactDOM from "react-dom"
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 min-w-80 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    {title && <h2 className="text-xl font-bold">{title}</h2>}
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl cursor-pointer"><X size={24}/></button>
                </div>
                <div>{children}</div>
            </div>
        </div>,
        document.body
    )
}