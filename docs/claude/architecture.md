# Project Architecture — BudgetFlow

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | React 19 + TypeScript               |
| Build tool | Vite                                |
| Styling    | Tailwind CSS                        |
| Routing    | react-router-dom                    |
| Charts     | recharts                            |
| State      | Context API + useReducer            |
| Persistence| localStorage (+ JSON export/import) |

## Folder structure

```
src/
  features/
    goals/
      components/     GoalCard.tsx, GoalForm.tsx, GoalList.tsx
      hooks/          useGoals.ts
      types/          goal.types.ts
      utils/          goalCalculations.ts
    budget/
      components/     BudgetForm.tsx, BudgetSummary.tsx
      hooks/          useBudget.ts
      types/          budget.types.ts
    dashboard/
      components/     SavingsChart.tsx, GlobalProgress.tsx
  context/
      AppContext.tsx   — AppContextType, createContext, useAppContext()
      AppReducer.ts   — pure function (state, action) => state + AppAction type
      AppProvider.tsx — useReducer, localStorage sync, Provider wrapper
  hooks/
      useLocalStorage.ts   — generic custom hook useLocalStorage<T>
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
      common.types.ts   — shared types across features
```

## Key architectural rules

- Each feature is self-contained: components, hooks, types in its own folder
- The global context is the ONLY sharing point between features
- `dashboard/` has no hooks/types of its own — it only reads from global context
- Shared UI components live in `components/ui/`
- No business logic in components — logic goes in hooks or utils

## Data flow

```
User interaction
  → Component dispatches action
    → AppReducer computes new state
      → AppProvider syncs to localStorage
        → Components re-render via context
```

## Spec reference

Full design spec: `docs/superpowers/specs/2026-03-21-budgetflow-design.md`
