import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/zod";
import { ZodError } from "zod";

async function verifyRecaptcha(
  token: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return { success: false, message: "reCAPTCHA not configured" };
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    console.error("reCAPTCHA verification failed:", data["error-codes"]);
    return { success: false, message: "reCAPTCHA verification failed" };
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return { success: false, message: "Error verifying reCAPTCHA" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, recaptchaToken } =
      await signUpSchema.parseAsync(body);

    // Verify reCAPTCHA token
    const recaptchaVerification = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaVerification.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "visitor",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    const createdUser = {
      ...userWithoutPassword,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(
      {
        message: "User created successfully",
        user: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
