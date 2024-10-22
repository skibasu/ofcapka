import React from "react"
import { format, addMilliseconds } from "date-fns"
import { BadgeProps } from "./Badge.types"
const Badge: React.FC<BadgeProps> = ({ date, duration }) => {
    return (
        <div className="py-1 px-3 bg-fuchsia-950 text-white font-medium">
            <span>
                {format(new Date(date), "H:mm")} -{" "}
                {format(addMilliseconds(new Date(date), duration), "H:mm")}
            </span>
        </div>
    )
}

export default Badge
