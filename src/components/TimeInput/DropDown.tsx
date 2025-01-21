import { useEffect, useRef } from "react"
import { useTimeInputContext } from "../../contexts/useTimeInputContext"
import classNames from "classnames"

const DropDown = () => {
    const { open, setOpen, closing, setClosing, setCanvasRef, clockClass } =
        useTimeInputContext()
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const wrapperRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (!wrapperRef?.current || !closing || !clockClass) return

        wrapperRef.current.addEventListener(
            "animationend",
            () => {
                console.log("Animation END")
                setClosing(false)
                setOpen(false)
                clockClass.setBoard("hours")
            },
            { once: true }
        )
    }, [closing, setOpen, setClosing, clockClass])
    useEffect(() => {
        setCanvasRef(canvasRef.current)
    })
    return (
        <div
            ref={wrapperRef}
            onMouseLeave={() => {
                setClosing(true)
            }}
            className={classNames(
                "opacity-0  absolute left-0 top-full border border-black  bg-white",
                { open: open, closing: closing, close: !open }
            )}
        >
            <canvas ref={canvasRef} />
        </div>
    )
}

export default DropDown
