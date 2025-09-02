import { createCrudRoute } from "@/lib/api/crud-generator";
import { eventSchema } from "@/lib/zod";
import type { z } from "zod";

type EventInput = z.infer<typeof eventSchema>;

const config = {
  entity: "events",
  schema: eventSchema,
  auth: true,
  roles: ["admin", "visitor"],
  beforeCreate: async (data: EventInput) => {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  beforeUpdate: async (data: Partial<EventInput>) => {
    return {
      ...data,
      updatedAt: new Date(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
