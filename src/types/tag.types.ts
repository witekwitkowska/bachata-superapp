import type { z } from "zod";
import { tagSchema } from "@/lib/zod";

export type Tag = z.infer<typeof tagSchema> & {
  id: string;
};

export type TagInput = z.infer<typeof tagSchema>;

export type TagUpdate = Partial<TagInput>;

export type TagCategory = "general" | "event" | "location" | "skill" | "style";

export interface TagWithStats extends Tag {
  recentUsage?: number;
  trendingScore?: number;
}

export interface TagFilters {
  category?: TagCategory;
  isActive?: boolean;
  search?: string;
}
