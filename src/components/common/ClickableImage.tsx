"use client";

import { useRef } from "react";
import { useFullscreenImage } from "@/hooks/useFullscreenImage";
import { FullscreenImageViewer } from "@/components/common/FullscreenImageViewer";

interface ClickableImageProps {
    src: string;
    alt: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
}

export function ClickableImage({ 
    src, 
    alt, 
    className = "", 
    onClick,
    children 
}: ClickableImageProps) {
    const { fullscreenImage, openFullscreenImage, closeFullscreenImage } = useFullscreenImage();
    const imageRef = useRef<HTMLImageElement | HTMLDivElement | null>(null);

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (onClick) {
            onClick(e);
            return;
        }

        const element = imageRef.current;
        if (element) {
            openFullscreenImage(src, alt, element as HTMLElement);
        }
    };

    return (
        <>
            <div
                ref={(el) => {
                    imageRef.current = el;
                }}
                className={`cursor-pointer ${className}`}
                onClick={handleImageClick}
            >
                {children || (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Fullscreen Image Viewer */}
            <FullscreenImageViewer
                fullscreenImage={fullscreenImage}
                onClose={closeFullscreenImage}
            />
        </>
    );
}
