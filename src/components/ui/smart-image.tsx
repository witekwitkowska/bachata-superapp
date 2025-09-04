"use client";

import { useState } from "react";

interface SmartImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    focus?: "face" | "auto" | "center";
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    fallback?: string;
}

export function SmartImage({
    src,
    alt,
    width = 400,
    height = 300,
    className = "",
    priority = false,
    sizes = "100vw",
    focus = "face",
    quality: imageQuality = 80,
    format = "auto",
    fallback
}: SmartImageProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleError = () => {
        setImageError(true);
    };

    const handleLoad = () => {
        setImageLoaded(true);
    };

    // Check if the image is a Cloudinary URL and generate optimized URL
    const isCloudinaryUrl = src.includes("cloudinary.com") || src.includes("res.cloudinary.com");

    let optimizedSrc = src;
    if (isCloudinaryUrl) {
        optimizedSrc = generateCloudinaryUrl(src, {
            width,
            height,
            focus,
            quality: imageQuality,
            format
        });
    }

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
                    objectPosition: getObjectPosition(focus)
                }}
            />
        );
    }

    return (
        <div className="relative overflow-hidden">
            <img
                src={optimizedSrc}
                alt={alt}
                className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                    } ${className}`}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                sizes={sizes}
                style={{
                    objectPosition: getObjectPosition(focus)
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

// Helper function to get object position based on focus type
function getObjectPosition(focus: "face" | "auto" | "center"): string {
    switch (focus) {
        case "face":
            return "object-top"; // Faces are typically at the top of images
        case "auto":
            return "object-center"; // Auto focus typically centers
        case "center":
        default:
            return "object-center";
    }
}

// Utility function to generate Cloudinary URLs with face detection
export function generateCloudinaryUrl(
    src: string,
    options: {
        width?: number;
        height?: number;
        focus?: "face" | "auto" | "center";
        quality?: number;
        format?: "auto" | "webp" | "jpg" | "png";
    } = {}
) {
    const {
        width = 400,
        height = 300,
        focus = "face",
        quality: imageQuality = 80,
        format = "auto"
    } = options;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

    // Extract public ID from Cloudinary URL
    const getPublicId = (url: string) => {
        const parts = url.split("/");
        const uploadIndex = parts.findIndex(part => part === "upload");
        if (uploadIndex !== -1 && uploadIndex + 1 < parts.length) {
            return parts.slice(uploadIndex + 2).join("/").split(".")[0];
        }
        return url;
    };

    const publicId = getPublicId(src);

    let transformations = `w_${width},h_${height},c_fill,q_${imageQuality}`;

    if (focus === "face") {
        transformations += ",g_face";
    } else if (focus === "auto") {
        transformations += ",g_auto";
    }

    if (format === "auto") {
        transformations += ",f_auto";
    } else if (format !== "jpg") {
        transformations += `,f_${format}`;
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
