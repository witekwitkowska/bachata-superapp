import { createCrudRoute } from "../crud-generator";
import { z } from "zod";

// Simple schema for demonstration
const simpleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

// Simple CRUD configuration - no authentication required
export const simpleCrudConfig = {
  entity: "simple-items",
  auth: false, // No authentication required
  schema: simpleSchema,
  sort: { createdAt: -1 as const },
  limit: 50,

  // Simple response transformation
  transformResponse: (data: any) => ({
    id: data._id.toString(),
    name: data.name,
    description: data.description,
    active: data.active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }),
};

// Generate the CRUD handlers
export const simpleCrud = createCrudRoute(simpleCrudConfig);
