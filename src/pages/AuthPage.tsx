import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const action = mode === "signin" ? signIn : signUp
    const { error: authError } = await action(email, password)
    setIsSubmitting(false)
    if (authError) {
      setError(authError)
    } else {
      navigate("/")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === "signin"
            ? "Retrouvez vos données sur tous vos appareils"
            : "Vos données vous suivront sur tous vos appareils"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            minLength={6}
            required
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null) }}
          className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {mode === "signin" ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
        </button>
      </div>
    </div>
  )
}
