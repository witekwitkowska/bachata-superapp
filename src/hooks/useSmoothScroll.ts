"use client";

import { useLenisScroll } from "@/contexts/SmoothScrollContext";
import { useCallback } from "react";

export function useSmoothScroll() {
  const lenis = useLenisScroll();

  const scrollToTop = useCallback(
    (duration = 1.5) => {
      if (!lenis) return;
      lenis.scrollTo(0, { duration });
    },
    [lenis]
  );

  const scrollToBottom = useCallback(
    (duration = 1.5) => {
      if (!lenis) return;
      lenis.scrollTo("bottom", { duration });
    },
    [lenis]
  );

  const scrollToElement = useCallback(
    (
      element: string | HTMLElement,
      options?: {
        duration?: number;
        offset?: number;
      }
    ) => {
      if (!lenis) return;

      const defaultOptions = {
        duration: 1.5,
        offset: 0,
        ...options,
      };

      lenis.scrollTo(element, defaultOptions);
    },
    [lenis]
  );

  const scrollToPosition = useCallback(
    (position: number, duration = 1.5) => {
      if (!lenis) return;
      lenis.scrollTo(position, { duration });
    },
    [lenis]
  );

  const stop = useCallback(() => {
    if (!lenis) return;
    lenis.stop();
  }, [lenis]);

  const start = useCallback(() => {
    if (!lenis) return;
    lenis.start();
  }, [lenis]);

  const destroy = useCallback(() => {
    if (!lenis) return;
    lenis.destroy();
  }, [lenis]);

  return {
    lenis,
    scrollToTop,
    scrollToBottom,
    scrollToElement,
    scrollToPosition,
    stop,
    start,
    destroy,
  };
}
