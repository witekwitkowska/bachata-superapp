import { createCrudRoute } from "@/lib/api/crud-generator";
import { tagSchema } from "@/lib/zod";
import type { z } from "zod";

type TagInput = z.infer<typeof tagSchema>;

const config = {
  entity: "tags",
  schema: tagSchema,
  auth: true,
  roles: ["admin"], // Only admins can manage tags
  projection: {} as Record<string, 0 | 1>, // This will enable the transform function
  sort: { name: 1 as const }, // Sort by name alphabetically
  beforeCreate: async (data: TagInput) => {
    return {
      ...data,
      name: data.name.toLowerCase().trim(), // Normalize tag names
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  beforeUpdate: async (data: Partial<TagInput>) => {
    return {
      ...data,
      name: data.name ? data.name.toLowerCase().trim() : undefined,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
