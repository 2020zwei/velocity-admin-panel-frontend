import { useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
    fn: T,
    delay = 300
) {
    const timerRef = useRef<number | null>(null);

    const debounced = (...args: Parameters<T>) => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => fn(...args), delay);
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    return debounced;
}
