import { createCrudRoute } from "@/lib/api/crud-generator";
import { locationSchema } from "@/lib/zod";
import type { z } from "zod";

type LocationInput = z.infer<typeof locationSchema>;

const config = {
  entity: "locations",
  schema: locationSchema,
  auth: true,
  roles: ["admin", "visitor"],
  projection: {} as Record<string, 0 | 1>, // This will enable the transform function
  beforeCreate: async (data: LocationInput) => {
    return {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  beforeUpdate: async (data: Partial<LocationInput>) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
