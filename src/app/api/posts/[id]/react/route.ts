import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { userInteractionSchema } from "@/lib/zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { reactionType } = body;

    if (!["lightning", "fire", "ice"].includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const postsCollection = db.collection("posts");
    const usersCollection = db.collection("users");

    // Get the post
    const post = await postsCollection.findOne({
      _id: new ObjectId(postId),
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Get the user
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare user interaction data
    const userInteraction = {
      userId: session.user.id,
      name: user.name || session.user.name || "Unknown",
      profileImage: user.avatars?.[0] || user.avatar || undefined,
    };

    // Validate user interaction
    userInteractionSchema.parse(userInteraction);

    // Determine which arrays to update based on reaction type
    const reactionField =
      reactionType === "lightning"
        ? "lightnings"
        : reactionType === "fire"
        ? "fires"
        : "ices";
    const userField =
      reactionType === "lightning"
        ? "lovedPosts"
        : reactionType === "fire"
        ? "likedPosts"
        : "savedPosts";

    // Check if user already reacted
    const postReactions = post[reactionField] || [];
    const hasReacted = postReactions.some(
      (r: any) => r.userId === session.user.id
    );

    // Update post reactions
    let updatedPostReactions;
    if (hasReacted) {
      // Remove reaction
      updatedPostReactions = postReactions.filter(
        (r: any) => r.userId !== session.user.id
      );
    } else {
      // Add reaction
      updatedPostReactions = [...postReactions, userInteraction];
    }

    // Update user's post arrays
    const userPosts = user[userField] || [];
    let updatedUserPosts;
    if (hasReacted) {
      // Remove post from user's array
      updatedUserPosts = userPosts.filter(
        (id: string) => id.toString() !== postId
      );
    } else {
      // Add post to user's array
      updatedUserPosts = [...userPosts, postId];
    }

    // Update post in database
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          [reactionField]: updatedPostReactions,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          [userField]: updatedUserPosts,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        hasReacted: !hasReacted,
        reactionCount: updatedPostReactions.length,
      },
    });
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process reaction",
      },
      { status: 500 }
    );
  }
}
