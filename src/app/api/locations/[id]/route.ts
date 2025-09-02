import { createCrudRoute } from "@/lib/api/crud-generator";
import { locationSchema } from "@/lib/zod";
import type { z } from "zod";

type LocationInput = z.infer<typeof locationSchema>;

const config = {
  entity: "locations",
  schema: locationSchema,
  auth: true,
  roles: ["admin", "visitor"],
  beforeUpdate: async (data: Partial<LocationInput>) => {
    return {
      ...data,
      updatedAt: new Date(),
    };
  },
};

const { GET: GET_BY_ID, PATCH, DELETE } = createCrudRoute(config);

export { GET_BY_ID as GET, PATCH, DELETE };
