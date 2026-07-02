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
