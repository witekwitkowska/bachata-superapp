import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/zod";
import { ZodError } from "zod";
import type { User, Account, Profile } from "next-auth";

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const { db, client } = await connectToDatabase();
          const usersCollection = db.collection("users");

          // Find the user in the database by email
          const user = await usersCollection.findOne({
            email: email,
          });

          // Impedir login si es team y status !== 'active'
          if (user && user.role === "team" && user.status !== "active") {
            throw new Error(
              "Esta cuenta no se encuentra activada. Consulte con su administrador."
            );
          }

          if (
            user &&
            (await bcrypt.compare(password as string, user.password as string))
          ) {
            // Passwords match; return the user object (excluding sensitive info)
            const userObj = {
              id: user._id.toString(),
              email: user.email,
              role: user.role || "visitor",
              name: user.name,
              companyId: user.companyId?.toString(),
            };
            return userObj;
          }

          return null;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile | undefined;
    }) {
      const { db, client } = await connectToDatabase();

      if (account && profile) {
        const existingUser = await db.collection("users").findOne({
          email: profile.email,
        });

        if (existingUser) {
          const existingAccount = await db.collection("accounts").findOne({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          if (!existingAccount) {
            await db.collection("accounts").updateOne(
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
              {
                $set: {
                  userId: existingUser._id,
                  email: profile.email,
                },
              },
              { upsert: true }
            );
          }
          return true;
        }
      }
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        const userId = token.sub || "";
        session.user = {
          ...session.user,
          id: userId,
          role: token.role as string,
          companyId: token.companyId as string,
        };
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request", // Point to your custom verify-request page
  },
  session: { strategy: "jwt" },
};
