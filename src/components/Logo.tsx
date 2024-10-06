import React from "react"
import { Link } from "react-router-dom"
import { ReactComponent as Logo } from "../assets/svg/logo-ofca.svg"
const LogoLink = () => {
    return (
        <Link to="/">
            <Logo />
        </Link>
    )
}

export default LogoLink
