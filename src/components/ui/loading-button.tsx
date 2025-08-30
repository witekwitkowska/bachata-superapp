import * as React from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
    loading?: boolean
    loadingText?: string
    children: React.ReactNode
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, className, disabled, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                disabled={disabled || loading}
                className={cn("relative", className)}
                {...props}
            >
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </motion.div>
                )}
                <motion.span
                    animate={{ opacity: loading ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {loading ? loadingText || children : children}
                </motion.span>
            </Button>
        )
    }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
