import { NextRequest } from "next/server";
import { userCrud } from "@/lib/api/examples/user-crud";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return userCrud.GET(request);
  } catch (error) {
    console.error("Users GET error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Add user update logic here
    return Response.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Users PUT error:", error);
    return Response.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
