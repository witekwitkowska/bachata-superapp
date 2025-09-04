import { z } from "zod";
import { createCrudRoute } from "@/lib/api/crud-generator";
import { userUpdateSchema } from "@/lib/zod";
import { ObjectId } from "mongodb";

// Extended user update schema to include avatar position
const extendedUserUpdateSchema = userUpdateSchema.extend({
  avatarX: z.number().min(0).max(100).optional(),
  avatarY: z.number().min(0).max(100).optional(),
});

export type UserUpdateData = z.infer<typeof extendedUserUpdateSchema>;

// CRUD configuration for users
export const userCrudConfig = {
  entity: "users",
  auth: true,
  roles: ["admin", "visitor"],
  schema: extendedUserUpdateSchema,
  projection: { password: 0 } as Record<string, 0 | 1>,
  sort: { createdAt: -1 as const },
  customFilters: (session: any) => ({
    // Only show active users by default
    status: "active",
  }),
  beforeUpdate: async (data: any, session: any, id: string) => {
    // Only admins can change roles
    if (data.role && session.user.role !== "admin") {
      throw new Error("Forbidden: Only admins can change user roles");
    }

    // Users can only update their own info (unless admin)
    if (session.user.role !== "admin" && session.user.id !== id) {
      throw new Error("Forbidden: Can only update your own profile");
    }

    return {
      ...data,
      updatedByName: session.user.name,
      updatedById: new ObjectId(String(session.user.id)),
      updatedAt: new Date(),
    };
  },
  beforeDelete: async (session: any, id: string) => {
    // Only admins can delete users
    if (session.user.role !== "admin") {
      throw new Error("Forbidden: Only admins can delete users");
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      throw new Error("Cannot delete your own account");
    }

    return true;
  },
  afterCreate: async (data: any, session: any) => {
    console.log(`User created by ${session.user.email}:`, data.email);
  },
  afterUpdate: async (data: any, session: any, id: string) => {
    console.log(`User ${id} updated by ${session.user.email}`);
  },
  afterDelete: async (id: string, session: any) => {
    console.log(`User ${id} deleted by ${session.user.email}`);
  },
};

// Generate CRUD routes
export const userCrud = createCrudRoute(userCrudConfig);
