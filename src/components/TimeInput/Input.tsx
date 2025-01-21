import React, { useEffect, useState } from "react"
import { useTimeInputContext } from "../../contexts/useTimeInputContext"
import { hoursRegex1, hoursRegex2, minutesRegex } from "./validation"
import { InputTime } from "./TimeInput.types"
import useDebounce from "../../hooks/useDebounce"

const Input = () => {
    const { setOpen, open, clockClass, time } = useTimeInputContext()

    const [inputTime, setInputTime] = useState<InputTime>({
        h: `${time.h}`,
        m: `${time.m}`,
        ampm: time.ampm,
    })

    const onChangeHours = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (hoursRegex1.test(value) || hoursRegex2.test(value)) {
            setInputTime((time) => ({ ...time, h: value }))
        }
    }

    const onChangeMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (minutesRegex.test(value)) {
            setInputTime((time) => ({ ...time, m: value }))
        }
    }

    const onChangeAMPM = () => {
        setInputTime((time) => ({
            ...time,
            ampm: time.ampm === "AM" ? "PM" : "AM",
        }))
    }

    const debounceFnHr = useDebounce((value: string) => {
        if (!clockClass || inputTime.h === "") return

        clockClass.setHours(Number(value))
    }, 600)
    const debounceFnMin = useDebounce((value: string) => {
        if (!clockClass || inputTime.m === "") return

        clockClass.setMinutes(Number(value))
    }, 600)

    useEffect(() => {
        debounceFnHr(inputTime.h)
        //eslint-disable-next-line
    }, [inputTime.h])

    useEffect(() => {
        debounceFnMin(inputTime.m)
        //eslint-disable-next-line
    }, [inputTime.m])

    useEffect(() => {
        if (!clockClass) return

        clockClass.setAmPm(inputTime.ampm)
        //eslint-disable-next-line
    }, [inputTime.ampm])

    useEffect(() => {
        const originalTime: InputTime = {
            h: `${time.h === 0 ? 12 : time.h}`,
            m: `${time.m}`,
            ampm: time.ampm,
        }
        const input: InputTime = {
            h:
                originalTime.h.length === 1
                    ? `0${originalTime.h}`
                    : originalTime.h,
            m:
                originalTime.m.length === 1
                    ? `0${originalTime.m}`
                    : originalTime.m,
            ampm: time.ampm,
        }
        setInputTime(input)
    }, [time])
    return (
        <div className="flex gap-2">
            <div>
                <input
                    className="w-[30px] p-1 border border-black"
                    value={inputTime.h}
                    onChange={onChangeHours}
                    onClick={() => {
                        clockClass?.setBoard("hours")
                        !open && setOpen(true)
                    }}
                    // onBlur={onBlur}
                />
                {` : `}
                <input
                    className="w-[30px] p-1 border border-black"
                    value={inputTime.m}
                    onChange={onChangeMinutes}
                    onClick={() => {
                        clockClass?.setBoard("minutes")
                        !open && setOpen(true)
                    }}
                />
            </div>
            <button
                className="p-1 border border-black bg-white"
                type="button"
                onClick={onChangeAMPM}
            >
                {inputTime.ampm}
            </button>
        </div>
    )
}

export default Input
