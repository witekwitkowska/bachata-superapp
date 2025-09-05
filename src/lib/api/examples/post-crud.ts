import { z } from "zod";
import { createCrudRoute } from "@/lib/api/crud-generator";
import { ObjectId } from "mongodb";

// Schema for posts
export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type PostData = z.infer<typeof postSchema>;

// CRUD configuration for posts
export const postCrudConfig = {
  entity: "posts",
  auth: true,
  roles: ["admin", "visitor"],
  schema: postSchema,
  projection: { __v: 0 } as Record<string, 0 | 1>,
  sort: { createdAt: -1 as const },
  customFilters: (session: any) => ({
    // Show published posts to everyone, drafts only to author
    $or: [{ published: true }, { authorId: session?.user?.id }],
  }),
  beforeCreate: async (data: any, session: any) => {
    // Auto-assign the author
    return {
      ...data,
      authorId: new ObjectId(String(session.user.id)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  beforeUpdate: async (data: any, session: any, id: string) => {
    // Check ownership
    const { connectToDatabase } = await import("@/lib/mongodb");
    const { db } = await connectToDatabase();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!post) {
      throw new Error("Post not found");
    }

    // Only author or admin can update
    if (session.user.role !== "admin" && post.authorId !== session.user.id) {
      throw new Error("Forbidden: Can only update your own posts");
    }

    return {
      ...data,
      updatedAt: new Date(),
    };
  },
  beforeDelete: async (session: any, id: string) => {
    // Check ownership
    const { connectToDatabase } = await import("@/lib/mongodb");
    const { db } = await connectToDatabase();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!post) {
      throw new Error("Post not found");
    }

    // Only author or admin can delete
    if (session.user.role !== "admin" && post.authorId !== session.user.id) {
      throw new Error("Forbidden: Can only delete your own posts");
    }

    return true;
  },
  afterCreate: async (data: any, session: any) => {},
  afterUpdate: async (data: any, session: any, id: string) => {},
  afterDelete: async (id: string, session: any) => {},
};

// Generate CRUD routes
export const postCrud = createCrudRoute(postCrudConfig);
