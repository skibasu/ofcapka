import { useCallback, useRef, useEffect } from "react"

const useDebounce = <T extends (...args: any[]) => void>(
    callback: T,
    delay: number
) => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const debounceFn = useCallback(
        (...args: Parameters<T>) => {
            if (timer.current) clearTimeout(timer.current)
            timer.current = setTimeout(() => {
                callback(...args)
            }, delay)
        },
        [callback, delay]
    )

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current)
        }
    }, [])

    return debounceFn
}

export default useDebounce
