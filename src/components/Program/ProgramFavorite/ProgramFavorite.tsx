import React, { useState } from "react"
import { ReactComponent as Star } from "../../../assets/svg/star.svg"

const ProgramFavorite = () => {
    const [isFavorite, setIsFavorite] = useState(false)
    return (
        <button onClick={() => setIsFavorite((isFavorite) => !isFavorite)}>
            <Star
                className={
                    isFavorite ? "[&_*_poligon]:fill-amber-400" : "#ffffff"
                }
                fill={isFavorite ? "#fbbf24" : "#ffffff"}
            />
        </button>
    )
}

export default ProgramFavorite
