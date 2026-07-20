import { createContext, useContext } from "react"
import type { Session } from "@supabase/supabase-js"

export interface AuthContextType {
    session: Session | null
    isAuthLoading: boolean
    signUp: (email: string, password: string) => Promise<{ error: string | null }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Ce fichier n'exporte aucun composant (contexte + hook uniquement).
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}

export default AuthContext
