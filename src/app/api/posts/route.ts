import { createCrudRoute } from "@/lib/api/crud-generator";
import { connectToDatabase } from "@/lib/mongodb";
import { postSchema } from "@/lib/zod";
import { ObjectId } from "mongodb";
import type { z } from "zod";

type PostInput = z.infer<typeof postSchema>;

const config = {
  entity: "posts",
  schema: postSchema,
  auth: false, // Visitors can create posts
  roles: [], // No role restrictions
  projection: {} as Record<string, 0 | 1>, // This will enable the transform function
  sort: { createdAt: -1 as const }, // Most recent first
  beforeCreate: async (data: PostInput) => {
    console.log("beforeCreate", data);
    try {
      const { db } = await connectToDatabase();

      const user = await db.collection("users").findOne({
        _id: new ObjectId(String(data.authorId)),
      });

      return {
        ...data,
        authorName: user?.name,
        authorEmail: user?.email,
        authorProfileImage: user?.avatars?.[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error beforeCreate", error);
      throw error;
    }
  },
  beforeUpdate: async (data: Partial<PostInput>) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET, POST, PATCH, DELETE } = createCrudRoute(config);

export { GET, POST, PATCH, DELETE };
