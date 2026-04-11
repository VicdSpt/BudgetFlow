interface ProgressBarProps {
  value: number;
  label?: string;
}

export default function ProgressBar({value, label}: ProgressBarProps) {
  return (

    <div className="w-full bg-gray-200 rounded-full">
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <div className="bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full h-4 flex items-center justify-center" style={{ width: `${value}%` }}>{value}%</div>
    </div>
  )
}