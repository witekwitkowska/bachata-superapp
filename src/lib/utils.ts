import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z, ZodTypeAny } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRequiredFields = (schema: ZodTypeAny): string[] => {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;

    return Object.entries(shape)
      .filter(([_, field]) => !field.isOptional())
      .map(([key]) => key);
  }

  // Handle non-object schemas gracefully
  return [];
};
