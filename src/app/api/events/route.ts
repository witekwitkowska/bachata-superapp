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
  customFilters: async (session: any, params?: URLSearchParams) => {
    const filters: any = {};

    // Filter by type
    if (params?.get("type")) {
      const types = params.get("type")?.split(",") || [];
      if (types.length > 0) {
        filters.type = { $in: types };
      }
    }

    if (params?.get("organizerId")) {
      filters.organizerId = {
        $in: params.get("organizerId")?.split(",") || [],
      };
    }

    if (params?.get("teacherId")) {
      filters.teacherId = {
        $in: params.get("teacherId")?.split(",") || [],
      };
    }

    // Filter by published status
    if (params?.get("published")) {
      filters.published = params.get("published") === "true";
    }

    return filters;
  },
  beforeCreate: async (data: EventInput) => {
    const { db } = await connectToDatabase();
    const location = await db
      .collection("locations")
      .findOne({ _id: new ObjectId(data.locationId) });

    // Type-safe access to organizerId for social and festival events
    const organizerId =
      data.type === "social" || data.type === "festival"
        ? (data as any).organizerId
        : undefined;

    return {
      ...data,
      location: location,
      ...(organizerId && {
        organizerId: new ObjectId(String(organizerId)),
      }),
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
