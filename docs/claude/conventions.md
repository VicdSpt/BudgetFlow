# Code Conventions — BudgetFlow

## TypeScript

- Use `interface` for object shapes (entities, component props)
- Use `type` for unions, aliases, discriminated unions, generics
- Always type component props explicitly — no implicit `any`
- Prefer explicit return types on functions and hooks

## Components

- One component per file
- File name matches the component name: `GoalCard.tsx` exports `GoalCard`
- Props interface defined at the top of the file, named `[ComponentName]Props`
- Default exports for components, named exports for utilities and hooks

## File & folder naming

- Folders: `camelCase` (e.g., `features/goals/`)
- Component files: `PascalCase` (e.g., `GoalCard.tsx`)
- Hook files: `camelCase` prefixed with `use` (e.g., `useGoals.ts`)
- Type files: `camelCase.types.ts` (e.g., `goal.types.ts`)
- Utility files: `camelCase` (e.g., `goalCalculations.ts`)

## Tailwind CSS

- Use Tailwind utility classes directly in JSX — no custom CSS unless unavoidable
- Group classes logically: layout → spacing → colors → typography → states
- Extract repeated class combinations into a component, not a CSS class

## Hooks

- Custom hooks live in their feature's `hooks/` folder, or in `src/hooks/` if shared
- Always prefix with `use`
- Return an object `{ data, actions }`, not a flat array, unless the hook is simple (e.g., `useToggle`)

## State management

- Local UI state: `useState`
- Global app state: Context + `useReducer` via `AppProvider`
- Never lift state higher than needed

## Imports

- Absolute imports from `src/` preferred over deep relative paths
- Order: external libs → internal modules → types → styles
