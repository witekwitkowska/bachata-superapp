import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMobile = (userAgent: string): boolean => {
  return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
};

export function getRequiredFields<T extends Record<string, unknown>>(
  schema: T
): (keyof T)[] {
  return Object.keys(schema).filter((key) => {
    const field = schema[key];
    return (
      field &&
      typeof field === "object" &&
      field !== null &&
      "required" in field &&
      (field as { required: unknown }).required
    );
  }) as (keyof T)[];
}

export function getZodRequiredFields(schema: z.ZodType<any, any>): string[] {
  try {
    // For Zod object schemas, we can try to infer the shape
    // This is a simplified approach that may not work for all schema types
    if (schema && typeof schema === "object" && "_def" in schema) {
      const def = (schema as any)._def;
      if (def && def.shape) {
        const shape = def.shape();
        if (shape && typeof shape === "object") {
          return Object.keys(shape).filter((key) => {
            const field = shape[key];
            // Check if field is not optional (required)
            return field && field._def && field._def.typeName !== "ZodOptional";
          });
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Use a base URL

export function hashJson(jsonObject: any) {
  // Convert JSON to string with sorted keys
  const jsonString = JSON.stringify(jsonObject, Object.keys(jsonObject).sort());

  // Create SHA-256 hash
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}

export function dateFormatter(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const formattedNumber = z
  .string()
  .regex(/^\d+$/, "Must be a string containing only numeric digits") // Validate first
  .transform((val) => {
    const trimmed = val.replace(/^0+/, ""); // Remove leading zeros
    return trimmed === "" ? "0" : trimmed; // Default to "0" if empty
  });

export const formattedPercentage = z
  .string()
  .regex(/^\d+%?$/, "Must be a numeric string, optionally ending with '%'");

export function convertToCSV(data: any[]): string {
  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers.map((header) => item[header]).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(data: any[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
