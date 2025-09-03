import { handleFetch } from "@/lib/fetch";
import { useCallback, useRef } from "react";

interface UseTableRefreshOptions<T> {
  endpoint: string;
  onRefresh?: (data: T[]) => void;
  onError?: (error: Error) => void;
  refreshDelay?: number;
}

export function useTableRefresh<T>({
  endpoint,
  onRefresh,
  onError,
  refreshDelay = 100,
}: UseTableRefreshOptions<T>) {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const refreshTable = useCallback(async () => {
    try {
      const { data, success, error } = await handleFetch(endpoint);
      if (!success) {
        throw new Error(`Failed to fetch data: ${error}`);
      }

      if (success && data) {
        onRefresh?.(data);
      } else {
        throw new Error(error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error refreshing table:", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    }
  }, [endpoint, onRefresh, onError]);

  const scheduleRefresh = useCallback(
    (delayMs: number = refreshDelay) => {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Schedule new refresh
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTable();
      }, delayMs);
    },
    [refreshTable, refreshDelay]
  );

  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  return {
    refreshTable,
    scheduleRefresh,
    clearRefreshTimeout,
  };
}
