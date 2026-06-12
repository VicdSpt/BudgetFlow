interface ProgressBarProps {
  value: number;
  label?: string;
}

export default function ProgressBar({value, label}: ProgressBarProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {(label) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          <span className="text-sm font-medium text-slate-700">{value.toFixed(2)}%</span>
        </div>
      )}
      {!label && (
        <div className="flex justify-end">
          <span className="text-xs font-medium text-slate-500">{value.toFixed(2)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}