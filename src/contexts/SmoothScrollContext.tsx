"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

interface SmoothScrollContextType {
    lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({ lenis: null });

export function useLenisScroll() {
    const context = useContext(SmoothScrollContext);
    if (!context) {
        throw new Error("useLenisScroll must be used within a SmoothScrollProvider");
    }
    return context.lenis;
}

interface SmoothScrollProviderProps {
    children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const lenisRef = useRef<Lenis | null>(null);
    const isIOSSafari = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !navigator.userAgent.includes('Chrome');
    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            lerp: isIOSSafari ? 0.05 : 0.1,          // Lower lerp for iOS Safari (smoother)
            duration: isIOSSafari ? 1.5 : 1.1,        // Longer duration for iOS Safari
            wheelMultiplier: isIOSSafari ? 0.8 : 1.2, // Lower multiplier for iOS Safari
            smoothWheel: !isIOSSafari,                  // Disable smooth wheel on iOS Safari
            touchMultiplier: 1,                         // Keep touch natural
            infinite: false,                            // Disable infinite scroll
        });

        lenisRef.current = lenis;

        // RAF loop for Lenis
        function raf(time: number) {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Cleanup function
        return () => {
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
        };
    }, []);

    return (
        <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
            {children}
        </SmoothScrollContext.Provider>
    );
}
