# BudgetFlow — Design Spec
**Date:** 2026-03-21
**Stack:** React 19 + TypeScript + Vite + TailwindCSS + react-router-dom + recharts
**Objectif:** App de gestion d'épargne personnelle, vitrine technique pour interviews React/TS

---

## 1. Contexte & Objectifs

BudgetFlow est une application personnelle de gestion de budget et d'objectifs d'épargne. Elle permet à l'utilisateur de :
- Définir des objectifs d'épargne (ex: moto, voyage, PC) avec prix cible, date limite et mensualité
- Gérer un budget mensuel global (revenus - dépenses fixes = disponible)
- Visualiser la progression de chaque objectif et le budget restant à allouer
- Persister les données en local (localStorage + export/import JSON)

Le projet est conçu pour couvrir un maximum de concepts React/TypeScript afin de servir de vitrine technique en entretien.

---

## 2. Architecture

### Structure de fichiers

```
src/
  features/
    goals/
      components/   GoalCard.tsx, GoalForm.tsx, GoalList.tsx
      hooks/        useGoals.ts
      types/        goal.types.ts
    budget/
      components/   BudgetForm.tsx, BudgetSummary.tsx
      hooks/        useBudget.ts
      types/        budget.types.ts
    dashboard/
      components/   SavingsChart.tsx, GlobalProgress.tsx
  context/
      AppContext.tsx
      AppReducer.ts
      AppProvider.tsx
  hooks/
      useLocalStorage.ts
  pages/
      DashboardPage.tsx
      GoalsPage.tsx
      BudgetPage.tsx
      SettingsPage.tsx
  components/
      ui/   Button.tsx, Modal.tsx, Input.tsx, ProgressBar.tsx
  router/
      index.tsx
  types/
      common.types.ts
```

### Principe de séparation
- Chaque feature est autonome : composants, hooks, types dans son propre dossier
- Le context global est le seul point de partage entre features
- Les composants UI partagés vivent dans `components/ui/`

---

## 3. Types TypeScript

```typescript
// goal.types.ts
interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  targetDate: string
  category: GoalCategory
  color: string
  createdAt: string
}

type GoalCategory = 'vehicle' | 'travel' | 'tech' | 'housing' | 'other'

type GoalAction =
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id' | 'createdAt'> }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_CONTRIBUTION'; payload: { goalId: string; amount: number } }

// budget.types.ts
interface Budget {
  monthlyIncome: number
  fixedExpenses: FixedExpense[]
}

interface FixedExpense {
  id: string
  label: string
  amount: number
}

// Clés localStorage typées
type StorageKey = 'budgetflow_goals' | 'budgetflow_budget'
```

---

## 4. State Management

### Pattern : Context + useReducer

```typescript
interface AppState {
  goals: Goal[]
  budget: Budget
}
```

- `AppProvider` wrappe toute l'app
- `AppReducer` centralise toutes les mutations de state
- `useAppContext()` : hook custom avec guard null pour consommer le context
- `useEffect` dans `AppProvider` : synchronisation automatique avec localStorage à chaque changement de state

### Valeurs calculées (exposées par le context)
- `availableMonthly` = revenus − dépenses fixes − total contributions objectifs
- `totalAllocated` = somme des `monthlyContribution` de tous les objectifs
- `monthsToGoal(goal)` : fonction utilitaire

---

## 5. Pages & Navigation

| Page | Route | Responsabilité |
|------|-------|----------------|
| Dashboard | `/` | Vue globale, graphique recharts, budget disponible |
| Objectifs | `/goals` | CRUD objectifs, progress bars, modal formulaire |
| Budget | `/budget` | Saisie revenus et dépenses fixes, récapitulatif |
| Paramètres | `/settings` | Export JSON, import JSON, reset données |

**Layout :** Navbar fixe en haut + `<Outlet />` react-router-dom
**Style :** Clean, minimaliste, moderne — fond blanc/gris clair, accents indigo ou emerald

---

## 6. Hooks par page

| Page | Hooks utilisés |
|------|----------------|
| Dashboard | `useAppContext()`, `useMemo` |
| GoalsPage | `useGoals()`, `useState` (modal, formulaire) |
| BudgetPage | `useBudget()`, `useCallback` (handlers) |
| SettingsPage | `useLocalStorage()` (export/import) |

---

## 7. Concepts React/TS couverts

| Concept | Où dans le projet |
|---------|------------------|
| `useState` | Formulaires, modals, toggle UI |
| `useEffect` | Sync localStorage, calculs on mount |
| `useContext` | Consommation AppContext partout |
| `useReducer` | AppReducer — state global |
| `useMemo` | Calculs dérivés dans Dashboard |
| `useCallback` | Handlers dans BudgetPage, GoalForm |
| Custom hooks | `useLocalStorage<T>`, `useGoals`, `useBudget` |
| Interfaces | Goal, Budget, FixedExpense |
| Types génériques | `useLocalStorage<T>` |
| Discriminated unions | `GoalAction` dans le reducer |
| `type` vs `interface` | Utilisés de façon cohérente |
| react-router-dom | Routes, `<Outlet>`, `useNavigate` |
| recharts | Graphique progression Dashboard |

---

## 8. Persistance des données

- **Lecture/écriture :** `useLocalStorage<T>` custom hook générique
- **Clés :** `budgetflow_goals`, `budgetflow_budget`
- **Export :** Téléchargement d'un fichier `budgetflow-export.json`
- **Import :** Lecture fichier JSON + validation de structure avant hydratation du state
- **Reset :** Suppression des clés localStorage + reset du state

---

## 9. Décisions techniques

- **Pas de backend** : tout en local, suffisant pour l'objectif d'apprentissage
- **Pas de bibliothèque de formulaires** (React Hook Form, Formik) : gestion native avec `useState` pour maximiser l'apprentissage
- **Pas de bibliothèque de state** (Redux, Zustand) : Context + useReducer natif React
- **TailwindCSS** : classes utilitaires uniquement, pas de CSS custom sauf si nécessaire
