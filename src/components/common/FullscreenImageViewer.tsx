"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { X } from "lucide-react";
import { FullscreenImageState } from "@/hooks/useFullscreenImage";

interface FullscreenImageViewerProps {
    fullscreenImage: FullscreenImageState | null;
    onClose: () => void;
}

export function FullscreenImageViewer({ fullscreenImage, onClose }: FullscreenImageViewerProps) {
    return (
        <Portal>
            <AnimatePresence>
                {fullscreenImage && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 1 }}
                        transition={{ type: "spring", damping: 40, stiffness: 280 }}
                        onClick={onClose}
                    >
                        {/* Blurred Background */}
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 1 }}
                            transition={{ type: "spring", damping: 40, stiffness: 280 }}
                        />

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* Fullscreen Image */}
                        <motion.img
                            src={fullscreenImage.src}
                            alt={fullscreenImage.alt}
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl z-1"
                            initial={{
                                x: fullscreenImage.rect.left - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2 + fullscreenImage.rect.width / 2,
                                y: fullscreenImage.rect.top - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2 + fullscreenImage.rect.height / 2,
                                width: fullscreenImage.rect.width,
                                height: fullscreenImage.rect.height,
                            }}
                            animate={{
                                x: 0,
                                y: 0,
                                width: "auto",
                                height: "auto",
                            }}
                            exit={{
                                x: fullscreenImage.rect.left - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2 + fullscreenImage.rect.width / 2,
                                y: fullscreenImage.rect.top - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2 + fullscreenImage.rect.height / 2,
                                width: fullscreenImage.rect.width,
                                height: fullscreenImage.rect.height,
                            }}
                            transition={{ type: "spring", damping: 40, stiffness: 280 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
