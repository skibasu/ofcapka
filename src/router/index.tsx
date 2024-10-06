import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from "../screens/Home"
import Artists from "../screens/Artists"
import Program from "../screens/Program"

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/program" element={<Program />} />
        </Routes>
    )
}

export default Router
