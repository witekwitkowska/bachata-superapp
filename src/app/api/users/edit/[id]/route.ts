import { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  getUserProfile,
  updateUserProfile,
} from "@/lib/api/examples/user-edit-crud";
import { userEditSchema } from "@/lib/zod";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Only allow users to get their own profile or admins to get any profile
    if (session.user.role !== "admin" && session.user.id !== id) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const profile = await getUserProfile(id);

    if (!profile) {
      return Response.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET user profile by ID error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Only allow users to update their own profile or admins to update any profile
    if (session.user.role !== "admin" && session.user.id !== id) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = userEditSchema.partial().parse(body);

    // Ensure the userId matches the params
    // if (validatedData.id && validatedData.id !== id) {
    //   return Response.json(
    //     { success: false, error: "User ID mismatch" },
    //     { status: 400 }
    //   );
    // }

    const result = await updateUserProfile(id, validatedData);

    return Response.json({
      success: true,
      data: { id: id },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PATCH user profile error:", error);
    return Response.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Only admins can delete profiles
    if (session.user.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return Response.json(
        { success: false, error: "Cannot delete your own profile" },
        { status: 400 }
      );
    }

    const { connectToDatabase } = await import("@/lib/mongodb");
    const { db } = await connectToDatabase();

    const result = await db
      .collection("userProfiles")
      .deleteOne({ userId: id });

    if (result.deletedCount === 0) {
      return Response.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: { id: id },
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("DELETE user profile error:", error);
    return Response.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
