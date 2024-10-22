import HandScript from "./HandScript/HandScript"
import LogoLink from "./Logo"
import Tabs from "./Tabs/Tabs"

const NavBar = () => {
    return (
        <header className="w-full fixed left-0 top-0 right-0 z-50">
            <div className="px-4 py-2 flex items-end max-h-16 relative bg-white border border-b-stone-500">
                <LogoLink />

                <HandScript className="ml-3 mt-auto" />
            </div>
            <Tabs />
        </header>
    )
}

export default NavBar
