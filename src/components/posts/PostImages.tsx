"use client";

import { useRef } from "react";
import { useFullscreenImage } from "@/hooks/useFullscreenImage";
import { FullscreenImageViewer } from "@/components/common/FullscreenImageViewer";

interface PostImagesProps {
    images: string[];
}

export function PostImages({ images }: PostImagesProps) {
    const { fullscreenImage, openFullscreenImage, closeFullscreenImage } = useFullscreenImage();
    const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

    const handleImageClick = (imageSrc: string, imageAlt: string, imageIndex: number) => {
        const imageElement = imageRefs.current[`image-${imageIndex}`];
        if (imageElement) {
            openFullscreenImage(imageSrc, imageAlt, imageElement);
        }
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
            <FullscreenImageViewer
                fullscreenImage={fullscreenImage}
                onClose={closeFullscreenImage}
            />
        </>
    );
}
