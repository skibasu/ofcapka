import { useLayoutEffect, useRef, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Home from "../screens/Home"
import Artists from "../screens/Artists"
import Program from "../screens/Program"

const Router = () => {
    const [height, setHeight] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        const header = document.querySelector("header") as HTMLHeadElement

        const headerheight = header.offsetHeight
        setHeight(headerheight)
    }, [])
    useLayoutEffect(() => {
        ref?.current?.style.setProperty("padding-top", `${height}px`)
    }, [height])
    return (
        <div ref={ref}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/program" element={<Program />} />
            </Routes>
        </div>
    )
}

export default Router
