import React from "react"
import { HandScriptProps } from "./HandScript.type"
import classNames from "classnames"
import { Link } from "react-router-dom"
const HandScript: React.FC<HandScriptProps> = ({ className }) => {
    return (
        <Link to="/program">
            {" "}
            <p className={classNames("font-handscript", className)}>
                <span className="block leading-none">Olesnica</span>
                <span className="text-sm flex items-start">
                    <span className="block leading-none">2024 15-18</span>
                    <span className="block leading-none text-2xs ml-1">
                        VII
                    </span>
                </span>
            </p>
        </Link>
    )
}

export default HandScript
