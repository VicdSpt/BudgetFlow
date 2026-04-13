import { createBrowserRouter } from "react-router-dom";
import BudgetPage from "../pages/BudgetPage";
import DashboardPage from "../pages/DashboardPage";
import GoalsPage from "../pages/GoalsPage";
import SettingsPage from "../pages/SettingsPage";
import Layout from "../components/ui/Layout"


export const router = createBrowserRouter([
    {
        path: "/", element: <Layout />, 
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "goals", element: <GoalsPage /> },
            { path: "budget", element: <BudgetPage /> },
            { path: "settings", element: <SettingsPage /> },
        ]
    }
])