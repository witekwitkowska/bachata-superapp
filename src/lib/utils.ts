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
    if (schema && typeof schema === "object" && "_def" in schema) {
      const def = (schema as any)._def;
      if (def && def.shape) {
        // shape is an object, not a function
        const shape = typeof def.shape === "function" ? def.shape() : def.shape;
        if (shape && typeof shape === "object") {
          return Object.keys(shape).filter((key) => {
            const field = shape[key];
            if (!field || !field._def) return false;

            // Check if field is optional (not required)
            if (field._def.type === "optional") return false;

            // For ZodDefault fields, check the inner type
            let actualField = field;
            if (field._def.type === "default") {
              actualField = field._def.innerType;
            }

            if (!actualField || !actualField._def) return false;

            // Check if the actual field is optional
            if (actualField._def.type === "optional") return false;

            // Check if field is an enum (usually required)
            if (actualField._def.type === "enum") return true;

            // Check if field is a literal (usually required)
            if (actualField._def.type === "literal") return true;

            // Check if field is a date (usually required)
            if (actualField._def.type === "date") return true;

            // Check if field is a boolean (usually not required - they have default values)
            if (actualField._def.type === "boolean") return false;

            // For string fields, check if they have min(1) validation
            if (actualField._def.type === "string") {
              const checks = actualField._def.checks || [];
              const hasMinCheck = checks.some(
                (check: any) => check.kind === "min" && check.value > 0
              );
              const hasMinLength =
                (actualField as any).minLength &&
                (actualField as any).minLength > 0;
              return hasMinCheck || hasMinLength;
            }

            // For array fields, check if they have min validation
            if (actualField._def.type === "array") {
              const checks = actualField._def.checks || [];
              return checks.some(
                (check: any) => check.kind === "min" && check.value > 0
              );
            }

            // For number fields, check if they have min validation
            if (actualField._def.type === "number") {
              const checks = actualField._def.checks || [];
              return checks.some(
                (check: any) => check.kind === "min" && check.value > 0
              );
            }

            return false;
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
