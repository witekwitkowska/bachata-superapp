import { z } from "zod";

/**
 * Extracts default values from a Zod schema
 * This function recursively traverses the schema to find default values
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   title: z.string().default(''),
 *   isPaid: z.boolean().default(false),
 *   startDate: z.date().default(() => new Date()),
 * });
 *
 * const defaults = extractSchemaDefaults(schema);
 * // Returns: { title: '', isPaid: false, startDate: Date }
 * ```
 */
export function extractSchemaDefaults<T extends z.ZodObject<any>>(
  schema: T
): Partial<z.infer<T>> {
  const defaults: Record<string, any> = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
    const defaultValue = extractFieldDefault(fieldSchema as z.ZodTypeAny);
    if (defaultValue !== undefined) {
      defaults[fieldName] = defaultValue;
    }
  }

  return defaults as Partial<z.infer<T>>;
}

/**
 * Recursively extracts default value from a Zod field
 */
function extractFieldDefault(schema: z.ZodTypeAny): any {
  // Handle ZodDefault
  if (schema.constructor.name === "ZodDefault") {
    const def = (schema as any)._def;
    if (def.defaultValue) {
      // If it's a function, call it
      if (typeof def.defaultValue === "function") {
        return def.defaultValue();
      }
      return def.defaultValue;
    }
  }

  // Handle ZodOptional
  if (schema.constructor.name === "ZodOptional") {
    const innerType = (schema as any)._def.innerType;
    return extractFieldDefault(innerType);
  }

  // Handle ZodNullable
  if (schema.constructor.name === "ZodNullable") {
    const innerType = (schema as any)._def.innerType;
    return extractFieldDefault(innerType);
  }

  // Handle ZodArray
  if (schema.constructor.name === "ZodArray") {
    const elementType = (schema as any)._def.element;
    const elementDefault = extractFieldDefault(elementType);
    return elementDefault !== undefined ? [elementDefault] : [];
  }

  // Handle ZodObject (nested objects)
  if (schema.constructor.name === "ZodObject") {
    const shape = (schema as any)._def.shape;
    const nestedDefaults: Record<string, any> = {};

    for (const [nestedFieldName, nestedFieldSchema] of Object.entries(shape)) {
      const nestedDefault = extractFieldDefault(
        nestedFieldSchema as z.ZodTypeAny
      );
      if (nestedDefault !== undefined) {
        nestedDefaults[nestedFieldName] = nestedDefault;
      }
    }

    return Object.keys(nestedDefaults).length > 0 ? nestedDefaults : undefined;
  }

  // Handle ZodUnion
  if (schema.constructor.name === "ZodUnion") {
    const options = (schema as any)._def.options;
    // Try to find a default in any of the union options
    for (const option of options) {
      const optionDefault = extractFieldDefault(option);
      if (optionDefault !== undefined) {
        return optionDefault;
      }
    }
  }

  // Handle ZodLiteral
  if (schema.constructor.name === "ZodLiteral") {
    return (schema as any)._def.value;
  }

  // Handle ZodEnum
  if (schema.constructor.name === "ZodEnum") {
    const values = (schema as any)._def.values;
    return values && values.length > 0 ? values[0] : undefined;
  }

  // For other types, return undefined (no default)
  return undefined;
}
