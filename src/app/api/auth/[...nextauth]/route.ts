import NextAuth from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/zod";

const handler = NextAuth({
  providers: [
    {
      id: "credentials",
      name: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );
          const { db } = await connectToDatabase();
          const usersCollection = db.collection("users");

          const user = await usersCollection.findOne({ email });
          if (user && (await bcrypt.compare(password, user.password))) {
            return {
              id: user._id.toString(),
              email: user.email,
              role: user.role || "visitor",
              name: user.name,
              companyId: user.companyId?.toString(),
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    },
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || "";
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
