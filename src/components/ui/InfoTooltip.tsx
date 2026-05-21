interface InfoTooltipProps {
  text: string
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="relative group inline-flex">
      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center cursor-default select-none hover:bg-slate-300 transition-colors">
        i
      </span>
      <div className="absolute left-0 top-6 w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
        <div className="absolute left-2 bottom-full border-4 border-transparent border-b-slate-800" />
        {text}
      </div>
    </div>
  )
}
