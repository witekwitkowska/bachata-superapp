"use client";

import { useState } from "react";

interface FaceFocusedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    fallback?: string;
    objectPosition?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function FaceFocusedImage({
    src,
    alt,
    width = 400,
    height = 300,
    className = "",
    priority = false,
    sizes = "100vw",
    fallback,
    objectPosition = "center"
}: FaceFocusedImageProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleError = () => {
        setImageError(true);
    };

    const handleLoad = () => {
        setImageLoaded(true);
    };

    if (imageError && fallback) {
        return (
            <img
                src={fallback}
                alt={alt}
                className={`object-cover transition-opacity duration-300 ${className}`}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                sizes={sizes}
                style={{
                    objectPosition: objectPosition
                }}
            />
        );
    }

    return (
        <div className="relative overflow-hidden">
            <img
                src={src}
                alt={alt}
                className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                    } ${className}`}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                sizes={sizes}
                style={{
                    objectPosition: objectPosition
                }}
                onError={handleError}
                onLoad={handleLoad}
            />
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}

// CSS utility classes for common face-focused positions
export const faceFocusClasses = {
    // For portraits - focus on upper center (where faces typically are)
    portrait: "object-center object-cover",
    // For group photos - focus on center
    group: "object-center object-cover",
    // For headshots - focus on top center
    headshot: "object-top object-cover",
    // For full body - focus on center
    fullbody: "object-center object-cover",
    // For event photos - focus on center
    event: "object-center object-cover"
} as const;

// Utility function to determine best object position based on image dimensions
export function getOptimalObjectPosition(
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
): string {
    const imageAspectRatio = imageWidth / imageHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    // If image is much taller than container, focus on top (likely portrait with face at top)
    if (imageAspectRatio < 0.6) {
        return "object-top";
    }

    // If image is much wider than container, focus on center
    if (imageAspectRatio > 1.5) {
        return "object-center";
    }

    // Default to center for square-ish images
    return "object-center";
}
