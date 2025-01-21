import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    PropsWithChildren,
    useEffect,
    SetStateAction,
} from "react"
import { Clock } from "../components/InputTime/Clock/Clock"
import { TimeValues } from "../components/InputTime/Clock/Clock.types"

type TimeInputContextProps = {
    open: boolean
    setOpen: Dispatch<boolean>
    closing: boolean
    setClosing: Dispatch<boolean>
    time: TimeValues
    setTime: Dispatch<SetStateAction<TimeValues>>
    canvasRef: HTMLCanvasElement | null
    setCanvasRef: Dispatch<HTMLCanvasElement | null>
    clockClass: Clock | null
}
interface TTimeInputContext extends PropsWithChildren {}
const TimeInputContext = createContext<TimeInputContextProps | undefined>(
    undefined
)

const TimeInputProvider: React.FC<TTimeInputContext> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [closing, setClosing] = useState<boolean>(false)
    const [time, setTime] = useState<TimeValues>({ h: 0, m: 0, ampm: "AM" })
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
    const [clockClass, initClockClass] = useState<Clock | null>(null)

    useEffect(() => {
        canvasRef && initClockClass(new Clock(canvasRef, setTime))
    }, [canvasRef])

    return (
        <TimeInputContext.Provider
            value={{
                open,
                setOpen,
                closing,
                setClosing,
                time,
                setTime,
                canvasRef,
                setCanvasRef,
                clockClass,
            }}
        >
            {children}
        </TimeInputContext.Provider>
    )
}

const useTimeInputContext = () => {
    const context = useContext(TimeInputContext)
    if (context === undefined) {
        throw new Error("useTabContext must be used within a TabProvider")
    }
    return context
}

export { TimeInputProvider, useTimeInputContext }
