import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import type { CarouselApi } from "@/components/ui/carousel";

/**
 * Custom hook to convert Embla carousel API to MotionValue for use with liquid indicator
 * Uses scrollProgress() for smooth continuous animation
 * @param api - The Embla carousel API
 * @param reduceBy2 - Whether to reduce count by 2 (for liquid indicator)
 * @returns MotionValue<number> that represents the carousel progress
 */
export function useCarouselMotion(api: CarouselApi | undefined) {
  const progress = useMotionValue(api?.scrollProgress() || 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [sliderWidth, setSliderWidth] = useState<number | undefined>(
    api?.internalEngine()?.containerRect?.width ?? 0
  );

  useEffect(() => {
    if (!api) return;

    // Get total number of slides
    const slides = api.slideNodes();
    setTotalSlides(slides.length);

    // Update progress when carousel scrolls (smooth continuous)
    const updateProgress = () => {
      const scrollProgress = api.scrollProgress();
      const limit = api.internalEngine()?.limit.length || 0;

      // Set smooth progress value (negative for liquid indicator)
      progress.set(scrollProgress * -limit);
    };

    // Update current index for discrete state
    const updateCurrentIndex = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    // Initial updates
    updateProgress();
    updateCurrentIndex();

    // Listen for carousel changes
    api.on("scroll", updateProgress);
    api.on("select", updateCurrentIndex);
    api.on("reInit", () => {
      updateProgress();
      updateCurrentIndex();
    });

    return () => {
      api.off("scroll", updateProgress);
      api.off("select", updateCurrentIndex);
      api.off("reInit", updateProgress);
    };
  }, [api, progress]);

  // Update slider width when container size changes
  useEffect(() => {
    if (api?.internalEngine()?.containerRect?.width !== sliderWidth) {
      setSliderWidth(api?.internalEngine()?.containerRect?.width);
    }
  }, [api?.internalEngine()?.containerRect?.width, sliderWidth]);

  return {
    progress,
    currentIndex,
    totalSlides: totalSlides,
    sliderWidth: sliderWidth ?? 0,
    // Helper function to scroll to specific index
    scrollTo: (index: number) => api?.scrollTo(index),
  };
}
