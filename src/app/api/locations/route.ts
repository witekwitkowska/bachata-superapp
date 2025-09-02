import { createCrudRoute } from "@/lib/api/crud-generator";
import { locationSchema } from "@/lib/zod";
import type { z } from "zod";

type LocationInput = z.infer<typeof locationSchema>;

const config = {
  entity: "locations",
  schema: locationSchema,
  auth: true,
  roles: ["admin", "visitor"],
  beforeCreate: async (data: LocationInput) => {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  beforeUpdate: async (data: Partial<LocationInput>) => {
    return {
      ...data,
      updatedAt: new Date(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
