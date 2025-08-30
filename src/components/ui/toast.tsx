"use client";

import { toast as sonnerToast, Toaster as Sonner } from "sonner";

type ToastProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToastProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-blue-600 dark:group-[.toast]:bg-blue-500 group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
            }}
            {...props}
        />
    );
};

export { Toaster, sonnerToast as toast };
