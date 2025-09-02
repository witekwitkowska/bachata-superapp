import { createCrudRoute } from "@/lib/api/crud-generator";
import { tagSchema } from "@/lib/zod";
import type { z } from "zod";

type TagInput = z.infer<typeof tagSchema>;

const config = {
  entity: "tags",
  schema: tagSchema,
  auth: true,
  roles: ["admin"], // Only admins can manage tags
  beforeUpdate: async (data: Partial<TagInput>) => {
    return {
      ...data,
      name: data.name ? data.name.toLowerCase().trim() : undefined,
      updatedAt: new Date().toISOString(),
    };
  },
};

const { GET: GET_BY_ID, PATCH, DELETE } = createCrudRoute(config);

export { GET_BY_ID as GET, PATCH, DELETE };
