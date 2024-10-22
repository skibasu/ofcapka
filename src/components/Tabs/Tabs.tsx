import React from "react"
import { useTabContext } from "../../contexts/use-tab-context"
const data = [
    { label: "Czwartek", id: "1", value: new Date() },
    { label: "Piatek", id: "2", value: new Date() },
    { label: "Sobota", id: "3", value: new Date() },
    { label: "Niedziela", id: "4", value: new Date() },
]
const Tabs = () => {
    const { activeTab, setActiveTab } = useTabContext()
    return (
        <div className="w-full overflow-hidden grid grid-cols-4 py-1 gap-1 px-1 bg-pale-pink">
            {data.map((d) => (
                <button
                    key={d.id}
                    className={`p-2 flex justify-center items-center border rounded-sm border-black  uppercase text-xs font-bold ${
                        activeTab === d.id ? "bg-pink-200" : "bg-white"
                    }`}
                    onClick={() => setActiveTab(d.id)}
                >
                    {d.label}
                </button>
            ))}
        </div>
    )
}

export default Tabs
