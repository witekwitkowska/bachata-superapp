import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import { CustomMongoDBAdapter } from "@/lib/custom-mongo-adapter";
import authConfig from "../../auth.config";
import clientPromise from "@/lib/mongodb";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    email?: string | null;
    image?: string | null;
    name?: string | null;
    companyId?: string | null;
  }
  interface Session extends DefaultSession {
    user: {
      role?: string;
      id?: string;
      companyId?: string | null;
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: CustomMongoDBAdapter(clientPromise),
  ...authConfig,
  session: { strategy: "jwt" },
  useSecureCookies: process.env.NODE_ENV === "production",
  ...(process.env.NODE_ENV === "production"
    ? {
        trustHost: true,
      }
    : {}),
});
