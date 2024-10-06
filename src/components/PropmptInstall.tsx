import React, { useEffect, useState } from "react"

interface Navigator {
    standalone?: boolean
}
const PromptInstall = () => {
    const [isIos, setIsIos] = useState(false)
    const [isInStandaloneMode, setIsInStandaloneMode] = useState(false)

    useEffect(() => {
        const userAgent = window.navigator.userAgent
        const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent)
        const isStandalone = (window.navigator as Navigator)?.standalone

        setIsIos(isIosDevice)
        setIsInStandaloneMode(!!isStandalone)
    }, [])

    if (isIos && !isInStandaloneMode) {
        return (
            <div className="prompt-install">
                <p className="font-lato font-bold">
                    To install this app on your iPhone, tap the "Share" button
                    and then select "Add to Home Screen".
                </p>
            </div>
        )
    }

    return null
}

export default PromptInstall
