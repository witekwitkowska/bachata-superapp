import { userCrud } from "@/lib/api/user-crud";

// GET all users (with pagination, filtering, and role-based access)
export const GET = userCrud.GET;

// POST create new user
export const POST = userCrud.POST;
