import { userCrud } from "@/lib/api/user-crud";

// GET user by ID
export const GET = userCrud.GET_BY_ID;

// PATCH update user
export const PATCH = userCrud.PATCH;

// DELETE user
export const DELETE = userCrud.DELETE;
