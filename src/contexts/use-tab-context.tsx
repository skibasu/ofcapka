import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    PropsWithChildren,
} from "react"

type TabContextProps = {
    activeTab: string
    setActiveTab: Dispatch<string>
}

const TabContext = createContext<TabContextProps | undefined>(undefined)

interface TabProviderProps extends PropsWithChildren {}

const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<string>("1")

    return (
        <TabContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </TabContext.Provider>
    )
}

const useTabContext = () => {
    const context = useContext(TabContext)
    if (context === undefined) {
        throw new Error("useTabContext must be used within a TabProvider")
    }
    return context
}

export { TabProvider, useTabContext }
