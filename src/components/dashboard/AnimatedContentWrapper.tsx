"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface AnimatedContentWrapperProps {
    children: React.ReactNode;
}

export function AnimatedContentWrapper({ children }: AnimatedContentWrapperProps) {
    const pathname = usePathname();

    return (
        <div className="p-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
