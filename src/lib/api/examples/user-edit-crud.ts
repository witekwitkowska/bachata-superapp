import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { userEditImagesSchema, userEditSchema } from "@/lib/zod";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import z from "zod";

export const userEditCrudConfig = {
  entity: "userProfiles",
  auth: true,
  roles: ["admin", "user"],
  schema: z.union([userEditSchema, userEditImagesSchema]),
  projection: { password: 0 },
  customFilters: (session: any) => ({
    userId: session?.user?.id,
  }),
  beforeUpdate: async (data: any, session: any, id: string) => {
    // Ensure users can only update their own profile
    if (session.user.role !== "admin" && session.user.id !== id) {
      throw new Error("Forbidden: Can only update your own profile");
    }
    return data;
  },
  afterUpdate: async (data: any, session: any, id: string) => {
    // Update the main users collection as well
    const { db } = await connectToDatabase();
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { updatedAt: new Date() } }
      );
  },
};

// Manual implementation for user profile editing
export async function getUserProfile(userId: string) {
  try {
    const { db } = await connectToDatabase();

    // Try to get from userProfiles collection first
    let profile = await db.collection("userProfiles").findOne({ userId });

    if (!profile) {
      // If no profile exists, get basic info from users collection
      const user = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { password: 0 } }
        );

      if (user) {
        // Create a basic profile
        profile = {
          _id: new ObjectId(),
          userId,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          bachataLevel: "beginner",
          isTeacher: false,
          bio: "",
          avatar: user.avatar,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save the new profile
        await db.collection("userProfiles").insertOne(profile as any);
      }
    }

    return profile;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: any) {
  try {
    const { db } = await connectToDatabase();

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("userProfiles")
      .updateOne({ userId }, { $set: updateData }, { upsert: true });

    // Also update the main users collection
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          updatedAt: new Date(),
        },
      }
    );

    return result;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
}

// API route handlers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Only allow users to get their own profile or admins to get any profile
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      return Response.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET user profile error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = userEditSchema.parse(body);

    // Ensure users can only create their own profile
    // if (session.user.role !== "admin" && session.user.id !== validatedData.id) {
    //   return Response.json(
    //     { success: false, error: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    const { db } = await connectToDatabase();

    const profile = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("userProfiles").insertOne(profile);

    return Response.json({
      success: true,
      data: { id: result.insertedId },
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("POST user profile error:", error);
    return Response.json(
      { success: false, error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
