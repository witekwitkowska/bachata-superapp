"use client";

import { toast as sonnerToast } from "@/components/ui/toast";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description,
        duration,
      });
    } else if (variant === "success") {
      sonnerToast.success(title || "Success", {
        description,
        duration,
      });
    } else {
      sonnerToast(title || "Info", {
        description,
        duration,
      });
    }
  };

  return { toast };
};
