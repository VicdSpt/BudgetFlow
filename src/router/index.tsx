import { createBrowserRouter } from "react-router-dom";
import BudgetPage from "../pages/BudgetPage";
import DashboardPage from "../pages/DashboardPage";
import GoalsPage from "../pages/GoalsPage";
import SettingsPage from "../pages/SettingsPage";


export const router = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "goals", element: <GoalsPage /> },
            { path: "budget", element: <BudgetPage /> },
            { path: "settings", element: <SettingsPage /> },
        ]
    }
])