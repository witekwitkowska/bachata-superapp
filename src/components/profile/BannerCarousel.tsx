"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { FullscreenImageModal } from "@/components/common/FullscreenImageModal";
import { cn } from "@/lib/utils";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import LiquidIndicator from "@/components/common/liquid-indicator";
import { useCarouselMotion } from "@/hooks/use-carousel-motion";

interface BannerCarouselProps {
    banners: string[];
    bannerPositions?: Array<{ x: number; y: number }>;
    isOwnProfile?: boolean;
    onEditPosition?: (bannerIndex: number) => void;
    className?: string;
}

interface BannerItemProps {
    banner: string;
    position: { x: number; y: number };
    index: number;
}

function BannerItem({ banner, position, index }: BannerItemProps) {
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [transform, setTransform] = useState('translate(0%, 0%) scale(1)');
    const imgRef = useRef<HTMLImageElement>(null);

    const handleImageLoad = () => {
        if (imgRef.current) {
            setImageDimensions({
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight
            });
            setIsLoaded(true);
        }
    };

    const calculateTransform = () => {
        if (!imageDimensions) return 'translate(0%, 0%) scale(1)';

        // Use a much larger scale to ensure complete coverage
        const scale = 1.5; // Fixed scale that ensures no gaps

        // Calculate translation range based on actual container dimensions (h-64 = 256px)
        const containerHeight = 256; // h-64 = 256px
        const containerWidth = 256 * (16 / 9); // Calculate width based on 16:9 aspect ratio
        const scaledHeight = imageDimensions.height * scale;
        const scaledWidth = imageDimensions.width * scale;

        // Calculate how much the scaled image extends beyond the container
        const extraHeight = scaledHeight - containerHeight;
        const extraWidth = scaledWidth - containerWidth;

        // With scale 1.5, extra space is 0.5x container size
        // For 100% editor position, we need to move by 0.25x container size
        const maxTranslateY = 25; // 0.25 * 100% = 25%
        const maxTranslateX = 25; // Same for width

        // Convert position percentages to translate values
        const clampedX = Math.max(0, Math.min(100, position.x));
        const clampedY = Math.max(0, Math.min(100, position.y));

        // Simple linear mapping: 0% = -maxTranslateY, 50% = 0, 100% = +maxTranslateY
        const translateX = ((clampedX - 50) / 50) * maxTranslateX;
        const translateY = ((clampedY - 50) / 50) * maxTranslateY;

        return `translate(${-translateX}%, ${-translateY}%) scale(${scale})`;
    };

    // Recalculate transform when position or image dimensions change
    useEffect(() => {
        if (isLoaded && imageDimensions) {
            const newTransform = calculateTransform();
            setTransform(newTransform);
        }
    }, [position, imageDimensions, isLoaded]);

    // Also recalculate when position changes directly
    useEffect(() => {
        if (isLoaded && imageDimensions) {
            const newTransform = calculateTransform();
            setTransform(newTransform);
        }
    }, [position.x, position.y]);

    return (
        <FullscreenImageModal
            src={banner}
            alt={`Profile banner ${index + 1}`}
            trigger={
                <div className="relative w-full h-full cursor-pointer overflow-hidden">
                    <img
                        ref={imgRef}
                        src={banner}
                        alt={`Profile banner ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                            transform: transform,
                            transition: 'transform 0.3s ease',
                            transformOrigin: '50% 50%'
                        }}
                        onLoad={handleImageLoad}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
            }
        />
    );
}

export function BannerCarousel({
    banners,
    bannerPositions = [],
    isOwnProfile = false,
    onEditPosition,
    className
}: BannerCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    // Use the custom hook to get motion values for liquid indicator
    const { progress, currentIndex, totalSlides, sliderWidth, scrollTo } = useCarouselMotion(api);

    if (!banners || banners.length === 0) {
        return (
            <div className={cn("relative h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 overflow-hidden rounded-lg", className)}>
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" />
            </div>
        );
    }

    const getBannerPosition = (index: number) => {
        const position = bannerPositions[index];
        return {
            x: position?.x ?? 50,
            y: position?.y ?? 50
        };
    };

    // Update current slide when carousel changes
    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Sync current state with motion hook
    useEffect(() => {
        setCurrent(currentIndex);
    }, [currentIndex]);

    return (
        <div className={cn("relative h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 overflow-hidden rounded-lg group", className)}>
            <Carousel
                setApi={setApi}
                className="w-full h-full"
                opts={{
                    align: "start",
                    loop: false,
                }}
            >
                <CarouselContent className="h-full">
                    {banners.map((banner, index) => {
                        const position = getBannerPosition(index);
                        return (
                            <CarouselItem key={index} className="h-full">
                                <BannerItem
                                    banner={banner}
                                    position={position}
                                    index={index}
                                />
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>

                {/* Navigation Arrows - Only show if more than 1 banner */}
                {banners.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </>
                )}

                {/* Edit Position Button - Only show for own profile */}
                {isOwnProfile && onEditPosition && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute z-10 top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/30 opacity-100 transition-opacity duration-200"
                        onClick={() => onEditPosition(current)}
                    >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Position
                    </Button>
                )}

                {/* Banner Counter - Only show if more than 1 banner */}
                {banners.length > 1 && (
                    <div className="absolute top-4 left-4 z-10 bg-black/20 text-white text-sm px-2 py-1 rounded-md">
                        {current + 1} / {banners.length}
                    </div>
                )}

                {/* Liquid Indicator - Only show if more than 1 banner */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <LiquidIndicator
                            count={totalSlides}
                            sliderWidth={sliderWidth}
                            indicatorColor="#ffffff"
                            size={8}
                            progress={progress}
                        />
                    </div>
                )}
            </Carousel>
        </div>
    );
}
