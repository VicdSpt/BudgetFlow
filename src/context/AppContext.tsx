import { createContext, useContext } from "react"
import { AppState, AppAction } from "../types/common.type"

interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = (): AppContextType => {

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppContext must be used within AppProvider")
    }
    return context
}

export default AppContext