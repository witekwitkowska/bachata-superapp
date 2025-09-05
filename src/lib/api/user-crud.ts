import { z } from "zod";
import { createCrudRoute } from "@/lib/api/crud-generator";
import { userUpdateSchema } from "@/lib/zod";
import { ObjectId } from "mongodb";

// Extended user update schema to include avatar position and status
const extendedUserUpdateSchema = userUpdateSchema.extend({
  avatarX: z.number().min(0).max(100).optional(),
  avatarY: z.number().min(0).max(100).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export type UserUpdateData = z.infer<typeof extendedUserUpdateSchema>;

// CRUD configuration for users
export const userCrudConfig = {
  entity: "users",
  auth: true,
  roles: ["admin"], // Only admins can access user management
  schema: extendedUserUpdateSchema,
  projection: { password: 0 } as Record<string, 0 | 1>,
  sort: { createdAt: -1 as const },
  customFilters: async (session: any, params?: URLSearchParams) => {
    const filters: any = {};

    // Filter by type
    if (params?.get("role")) {
      filters.role = params.get("role");
    }

    if (params?.get("status")) {
      filters.status = params.get("status");
    }

    if (params?.get("isTeacher")) {
      filters.isTeacher = params.get("isTeacher") === "true";
    }

    if (params?.get("isPublic")) {
      filters.isPublic = params.get("isPublic") === "true";
    }

    if (params?.get("name")) {
      filters.name = { $regex: params.get("name"), $options: "i" };
    }

    if (params?.get("email")) {
      filters.email = { $regex: params.get("email"), $options: "i" };
    }

    if (params?.get("location")) {
      filters.location = { $regex: params.get("location"), $options: "i" };
    }

    if (params?.get("website")) {
      filters.website = { $regex: params.get("website"), $options: "i" };
    }

    return filters;
  },
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
