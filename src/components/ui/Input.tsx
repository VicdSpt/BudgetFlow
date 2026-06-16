interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({label, error, ...props}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent ${props.className ?? ""}`}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  )
}