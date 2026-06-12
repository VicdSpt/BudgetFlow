import { useAppContext } from "../context/AppContext"
import Button from "../components/ui/Button"
import InfoTooltip from "../components/ui/InfoTooltip"
import { useRef } from "react"

export default function SettingsPage() {
  const { state, dispatch } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "budgetflow-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // lire le fichier et dispatcher HYDRATE_GOALS + HYDRATE_BUDGET + HYDRATE_TRANSACTIONS
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        // ?? = fallback si le champ est absent (ex: vieux fichier exporté avant la feature transactions)
        dispatch({ type: "HYDRATE_BUDGET", payload: parsed.budget ?? { monthlyIncomes: [], spendingList: [] } })
        dispatch({ type: "HYDRATE_GOALS", payload: parsed.goals ?? [] })
        dispatch({ type: "HYDRATE_TRANSACTIONS", payload: parsed.transactions ?? [] })
      } catch {
        alert("Fichier invalide : impossible de lire cette sauvegarde.")
      }
    }

    reader.readAsText(file)

  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-800">Paramètres</h1>
          <InfoTooltip text="Exportez vos données en JSON pour les sauvegarder ou les transférer, et importez un fichier de sauvegarde pour restaurer vos données." />
        </div>
        <p className="text-sm text-slate-500 mt-1">Gérez vos données</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-1">Sauvegarde des données</h2>
        <p className="text-sm text-slate-500 mb-4">Exportez vos données pour les sauvegarder ou les transférer sur un autre appareil</p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleExport}>Exporter JSON</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Importer JSON</Button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  )
}
