import type { z } from "zod";
import { postSchema, userInteractionSchema } from "@/lib/zod";

export type Post = z.infer<typeof postSchema> & {
  id: string;
};

export type UserInteraction = z.infer<typeof userInteractionSchema>;

export type PostInput = z.infer<typeof postSchema>;

export type PostUpdate = Partial<PostInput>;

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export interface PostReaction {
  type: "lightning" | "fire" | "ice";
  userId: string;
  name: string;
  profileImage?: string;
}
