import { createCrudRoute } from "@/lib/api/crud-generator";
import { postSchema } from "@/lib/zod";
import type { z } from "zod";

type PostInput = z.infer<typeof postSchema>;

const config = {
  entity: "posts",
  schema: postSchema,
  auth: false, // Visitors can access posts
  roles: [], // No role restrictions
  beforeUpdate: async (data: Partial<PostInput>) => {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET_BY_ID, PATCH, DELETE } = createCrudRoute(config);

export { GET_BY_ID as GET, PATCH, DELETE };
