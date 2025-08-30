import { z } from "zod";
import { createCrudRoute } from "@/lib/api/crud-generator";

// Schema for user updates
export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["visitor", "user", "team", "admin"]).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  companyId: z.string().optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

// CRUD configuration for users
export const userCrudConfig = {
  entity: "users",
  auth: false,
  roles: ["visitor", "user", "team", "admin"],
  schema: userUpdateSchema,
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

    return data;
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
