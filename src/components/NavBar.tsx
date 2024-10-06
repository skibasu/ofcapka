import HandScript from "./HandScript"
import LogoLink from "./Logo"

const NavBar = () => {
    return (
        <header className="px-4 py-2 w-full bg-white flex max-h-16 overflow-hidden">
            <LogoLink />
            <HandScript />
        </header>
    )
}

export default NavBar
