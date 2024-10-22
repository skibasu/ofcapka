import React, { useEffect } from "react"
import { SelectProps } from "./Select.types"
import classNames from "classnames"
import { useProgramListContext } from "../../contexts/use-program-context"
import SelectList from "./SelectList"

const Select: React.FC<SelectProps> = ({ options, className }) => {
    const { selectedDay, setSelectedDay, setOpen } = useProgramListContext()

    useEffect(() => {
        options?.[0] && setSelectedDay(options[0])
    }, [options])

    return selectedDay?.id ? (
        <div className={classNames("select", className)}>
            <button
                onClick={() => setOpen(true)}
                id={`${selectedDay.value}${selectedDay?.id}`}
            >
                <h1 className="h1 ml-4 leading-1 -mb-[4px] font-handscript text-fuchsia-950">
                    {selectedDay.label}
                </h1>
            </button>

            <SelectList options={options} />
        </div>
    ) : null
}

export default Select
