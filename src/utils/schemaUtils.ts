import { z } from "zod";

/**
 * Detects which fields in a Zod schema are array types
 */
export function getArrayFields(schema: z.ZodObject<z.ZodRawShape>): string[] {
  const arrayFields: string[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
    if (fieldSchema instanceof z.ZodArray) {
      arrayFields.push(fieldName);
    }
  }

  return arrayFields;
}

/**
 * Detects which fields in a Zod schema are boolean types
 */
export function getBooleanFields(schema: z.ZodObject<z.ZodRawShape>): string[] {
  const booleanFields: string[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
    if (fieldSchema instanceof z.ZodBoolean) {
      booleanFields.push(fieldName);
    }
  }

  return booleanFields;
}

/**
 * Detects which fields in a Zod schema are select/option types
 * (enums, unions, or specific string patterns)
 */
export function getSelectorFields(
  schema: z.ZodObject<z.ZodRawShape>
): string[] {
  const selectorFields: string[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
    if (
      fieldSchema instanceof z.ZodEnum ||
      fieldSchema instanceof z.ZodUnion ||
      fieldSchema instanceof z.ZodString
    ) {
      selectorFields.push(fieldName);
    }
  }

  return selectorFields;
}

/**
 * Gets all field names from a Zod schema, excluding specified fields
 */
export function getSchemaFields(
  schema: z.ZodObject<z.ZodRawShape>,
  excludeFields: string[] = []
): string[] {
  return Object.keys(schema.shape).filter(
    (field) => !excludeFields.includes(field)
  );
}
