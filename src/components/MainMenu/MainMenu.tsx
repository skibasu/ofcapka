import React from "react"
import { config } from "./config"
import MenuItem from "./MenuItem/MenuItem"

const MainMenu = () => {
    return (
        <nav>
            <ul>
                {config.menu.map((item) => (
                    <li>
                        <MenuItem path={item.path} iconType={item.iconType} />
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default MainMenu
