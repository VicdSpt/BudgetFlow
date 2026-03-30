interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    variant: "primary" | "secondary" | "danger" | "success" | "warning" | "ghost";
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export default function Button({ children, variant, onClick, disabled, type = 'button' }: ButtonProps) {

    const varientButton: Record<ButtonProps["variant"], string> = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-yellow-500 text-white hover:bg-yellow-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-orange-600 text-white hover:bg-orange-700",
        ghost: "text-gray-500 hover:text-gray-800 bg-transparent"
    }
    return (
        <button type={type} onClick={onClick}
            disabled={disabled}
            className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${varientButton[variant]}`}>
            {children}
        </button>
    )
}