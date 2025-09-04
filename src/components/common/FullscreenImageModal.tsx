"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullscreenImageModalProps {
    src: string;
    alt: string;
    trigger?: React.ReactNode;
    className?: string;
}

export function FullscreenImageModal({
    src,
    alt,
    trigger,
    className
}: FullscreenImageModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <>
            {trigger ? (
                <div
                    className={cn("cursor-pointer", className)}
                    onClick={() => setIsOpen(true)}
                >
                    {trigger}
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", className)}
                    onClick={() => setIsOpen(true)}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain"
                            onClick={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
