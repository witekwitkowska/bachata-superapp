"use client";

import { useState } from "react";

export interface FullscreenImageState {
    src: string;
    alt: string;
    rect: DOMRect;
}

export function useFullscreenImage() {
    const [fullscreenImage, setFullscreenImage] = useState<FullscreenImageState | null>(null);

    const openFullscreenImage = (src: string, alt: string, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        setFullscreenImage({
            src,
            alt,
            rect,
        });
    };

    const closeFullscreenImage = () => {
        setFullscreenImage(null);
    };

    return {
        fullscreenImage,
        openFullscreenImage,
        closeFullscreenImage,
    };
}
