import { createCrudRoute } from "@/lib/api/crud-generator";
import { eventSchema } from "@/lib/zod";
import type { z } from "zod";

type EventInput = z.infer<typeof eventSchema>;

const config = {
  entity: "events",
  schema: eventSchema,
  auth: true,
  roles: ["admin", "visitor"],
  beforeUpdate: async (data: Partial<EventInput>) => {
    return {
      ...data,
      updatedAt: new Date(),
    };
  },
};

const { GET_BY_ID, PATCH, DELETE } = createCrudRoute({
  ...config,
  paramName: "eventId", // Override the default 'id' parameter name
});

export { GET_BY_ID as GET, PATCH, DELETE };
