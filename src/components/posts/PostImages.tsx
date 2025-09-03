"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { X } from "lucide-react";

interface PostImagesProps {
    images: string[];
}

export function PostImages({ images }: PostImagesProps) {
    const [fullscreenImage, setFullscreenImage] = useState<{
        src: string;
        alt: string;
        rect: DOMRect;
    } | null>(null);
    const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

    const handleImageClick = (imageSrc: string, imageAlt: string, imageIndex: number) => {
        const imageElement = imageRefs.current[`image-${imageIndex}`];
        if (imageElement) {
            const rect = imageElement.getBoundingClientRect();
            setFullscreenImage({
                src: imageSrc,
                alt: imageAlt,
                rect: rect,
            });
        }
    };

    const closeFullscreenImage = () => {
        setFullscreenImage(null);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <>
            <div className={`grid gap-2 ${images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2"
                }`}>
                {images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                        <img
                            ref={(el) => {
                                imageRefs.current[`image-${index}`] = el;
                            }}
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-auto object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(image, `Post image ${index + 1}`, index)}
                        />
                        {images.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    +{images.length - 4} more
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Fullscreen Image Viewer */}
            <Portal>
                <AnimatePresence>
                    {fullscreenImage && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 1 }}
                            transition={{ type: "spring", damping: 40, stiffness: 280 }}
                            onClick={closeFullscreenImage}
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
                                onClick={closeFullscreenImage}
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
        </>
    );
}
