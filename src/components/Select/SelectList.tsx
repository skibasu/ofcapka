import React from "react"
import { SelectProps } from "./Select.types"
import { useProgramListContext } from "../../contexts/use-program-context"

const SelectList: React.FC<SelectProps> = ({ options }) => {
    const { setSelectedDay, setOpen, open } = useProgramListContext()
    return open ? (
        <div className="fixed top-[100px] left-[30px] w-[400px] h-[80px] bg-white rounded-sm border border-fuchsia-950 z-50 flex flex-column justify-center items-center">
            {options?.map((option) => (
                <button
                    key={option.id}
                    onClick={() => {
                        setOpen(false)
                        setSelectedDay(option)
                    }}
                    id={option.id}
                    className="mb-4"
                >
                    <h1 className="h1 pl-4 leading-1 font-handscript text-fuchsia-950">
                        {option.label}
                    </h1>
                </button>
            ))}
        </div>
    ) : null
}

export default SelectList
