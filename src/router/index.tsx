import { createBrowserRouter, Navigate } from "react-router-dom";
import BudgetPage from "../pages/BudgetPage";
import DashboardPage from "../pages/DashboardPage";
import GoalsPage from "../pages/GoalsPage";
import SettingsPage from "../pages/SettingsPage";
import TransactionsPage from "../pages/TransactionsPage";
import AuthPage from "../pages/AuthPage";
import Layout from "../components/ui/Layout"
import { isSupabaseConfigured } from "../lib/supabase";


export const router = createBrowserRouter([
    {
        path: "/", element: <Layout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "goals", element: <GoalsPage /> },
            { path: "budget", element: <BudgetPage /> },
            { path: "transactions", element: <TransactionsPage /> },
            { path: "settings", element: <SettingsPage /> },
            // Route compte : uniquement si Supabase est configuré. Sinon l'URL
            // tombe dans le catch-all et renvoie au dashboard.
            ...(isSupabaseConfigured ? [{ path: "auth", element: <AuthPage /> }] : []),
            { path: "*", element: <Navigate to="/" replace /> },
        ]
    }
])
