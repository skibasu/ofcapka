import React, { useCallback, useEffect, useState } from "react"
import Program from "../components/Program/Program"
import { allEvents } from "../data/events"
import { useLocation } from "react-router-dom"
import { useTabContext } from "../contexts/use-tab-context"
import { TProgramEvent } from "../data/data.types"

const ProgramScreen = () => {
    const { pathname } = useLocation()
    const { activeTab } = useTabContext()
    const [data, setData] = useState<TProgramEvent[]>([])
    const selectDay = useCallback((id: string) => {
        switch (id) {
            case "1":
                return allEvents.thursdayEvents
            case "2":
                return allEvents.fridayEvents
            default:
                return allEvents.thursdayEvents
        }
    }, [])

    useEffect(() => {
        console.log(activeTab)
        const events = selectDay(activeTab)
        if (events.length < 0) return

        setData(events)
    }, [activeTab, selectDay])

    return (
        <section id={pathname} className="px-4 pt-4">
            <Program events={data} />
        </section>
    )
}

export default ProgramScreen
