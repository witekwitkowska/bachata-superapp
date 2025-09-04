import { createCrudRoute } from "@/lib/api/crud-generator";
import { locationSchema } from "@/lib/zod";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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
  afterUpdate: async (
    data: Partial<LocationInput>,
    session: any,
    id: string
  ) => {
    try {
      const { db } = await connectToDatabase();

      // Get the updated location data
      const updatedLocation = await db
        .collection("locations")
        .findOne({ _id: new ObjectId(String(id)) });

      if (updatedLocation) {
        // Update all events that have this location populated in their location object
        const result = await db.collection("events").updateMany(
          {
            "location._id": new ObjectId(String(id)), // Events that have the location object populated
          },
          {
            $set: {
              location: updatedLocation,
              updatedAt: new Date(),
            },
          }
        );
      }
    } catch (error) {
      console.error("Error updating events with new location data:", error);
      // Don't throw error to avoid breaking the location update
    }
  },
};

const { GET_BY_ID, PATCH, DELETE } = createCrudRoute(config);

export { GET_BY_ID as GET, PATCH, DELETE };
