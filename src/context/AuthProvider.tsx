import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import AuthContext from "./AuthContext"
import { supabase } from "../lib/supabase"

// Traduit les messages d'erreur Supabase les plus courants
function translateAuthError(message: string): string {
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect."
    if (message.includes("already registered")) return "Un compte existe déjà avec cet email."
    if (message.includes("at least 6 characters")) return "Le mot de passe doit contenir au moins 6 caractères."
    if (message.includes("valid email")) return "Adresse email invalide."
    return "Une erreur est survenue. Réessayez."
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    useEffect(() => {
        // Restaure la session existante au démarrage (supabase-js la stocke lui-même)
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setIsAuthLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, isAuthLoading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
