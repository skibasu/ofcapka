import { useState, useEffect } from "react"

const InstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstallable, setIsInstallable] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = () => {
            // Prevent the default prompt from showing up
            event?.preventDefault()
            // Save the event for later use
            setDeferredPrompt(event)
            setIsInstallable(true)
        }

        // Add the event listener
        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        )

        // Clean up the event listener
        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            )
        }
    }, [])

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the install prompt")
                } else {
                    console.log("User dismissed the install prompt")
                }
                setDeferredPrompt(null)
                setIsInstallable(false)
            })
        }
    }

    return (
        <>
            {isInstallable && (
                <button onClick={handleInstallClick}>Install App</button>
            )}
        </>
    )
}

export default InstallButton
