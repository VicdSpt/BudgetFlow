import { createClient } from '@supabase/supabase-js'

// Fallback placeholder : sans .env.local (projet Supabase pas encore créé),
// l'app doit démarrer en mode invité — createClient(undefined) crasherait au chargement.
// L'auth échouera proprement (erreur réseau) tant que les vraies clés ne sont pas configurées.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('[supabase] VITE_SUPABASE_URL manquante — mode invité uniquement (voir .env.example)')
}

export const supabase = createClient(url, anonKey)
