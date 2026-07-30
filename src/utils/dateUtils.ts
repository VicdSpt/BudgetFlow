// Mois courant au format "YYYY-MM" en HEURE LOCALE.
// Ne pas utiliser toISOString() ici : elle renvoie l'heure UTC, ce qui
// décale le mois le 1er entre minuit et 2h du matin en France (UTC+1/+2).
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Date du jour au format "YYYY-MM-DD" en heure locale (même raison).
export function getToday(): string {
  const now = new Date()
  return `${getCurrentMonth()}-${String(now.getDate()).padStart(2, '0')}`
}

// Formate "YYYY-MM-DD" en "25 déc. 2026".
// Les parties sont passées séparément au constructeur Date plutôt que la chaîne
// entière : new Date("2026-12-25") est interprétée en UTC, et l'affichage local
// reculerait d'un jour pour tout fuseau à l'ouest de Greenwich.
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return date
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
