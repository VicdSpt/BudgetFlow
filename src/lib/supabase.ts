import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Source de vérité unique : la fonctionnalité "compte cloud" est-elle disponible ?
// Sans clés configurées, BudgetFlow tourne en local (localStorage) et masque
// entièrement l'auth — plutôt que d'exposer un bouton qui mène à une erreur réseau.
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.info('[supabase] non configuré — BudgetFlow tourne en mode local (voir .env.example)')
}

// Le client est créé dans tous les cas : AuthProvider l'importe au chargement du
// module et createClient(undefined) crasherait. Avec les placeholders il existe
// mais plus personne ne l'appelle.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)
