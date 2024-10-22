import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    PropsWithChildren,
} from "react"
import { SelectOption } from "../components/Select/Select.types"

type ProgramListContextProps = {
    open: boolean
    setOpen: Dispatch<boolean>
    selectedDay: SelectOption | null
    setSelectedDay: Dispatch<SelectOption>
}
interface TProgramListContext extends PropsWithChildren {}
const ProgramListContext = createContext<ProgramListContextProps | undefined>(
    undefined
)

const ProgramListProvider: React.FC<TProgramListContext> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [selectedDay, setSelectedDay] = useState<SelectOption | null>(null)

    return (
        <ProgramListContext.Provider
            value={{ open, setOpen, selectedDay, setSelectedDay }}
        >
            {children}
        </ProgramListContext.Provider>
    )
}

const useProgramListContext = () => {
    const context = useContext(ProgramListContext)
    if (context === undefined) {
        throw new Error("useTabContext must be used within a TabProvider")
    }
    return context
}

export { ProgramListProvider, useProgramListContext }
