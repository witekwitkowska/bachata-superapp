import { createCrudRoute } from "@/lib/api/crud-generator";
import { connectToDatabase } from "@/lib/mongodb";
import { eventSchema } from "@/lib/zod";
import { ObjectId } from "mongodb";
import type { z } from "zod";

type EventInput = z.infer<typeof eventSchema>;

const config = {
  entity: "events",
  schema: eventSchema,
  auth: true,
  roles: ["admin", "visitor", "organizer"],
  projection: {} as Record<string, 0 | 1>, // This will enable the transform function
  beforeCreate: async (data: EventInput) => {
    console.log(data);
    const { db } = await connectToDatabase();
    const location = await db
      .collection("locations")
      .findOne({ _id: new ObjectId(data.locationId) });

    return {
      ...data,
      location: location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  beforeUpdate: async (data: Partial<EventInput>) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
