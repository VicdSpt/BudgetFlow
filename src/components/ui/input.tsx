interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({label, error, ...props}: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} className="rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}