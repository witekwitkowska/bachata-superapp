import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { AdapterUser } from "next-auth/adapters";
import type { Adapter } from "next-auth/adapters";
import { ObjectId } from "mongodb";

export interface CustomAdapterUser extends AdapterUser {
  role: string;
  id: string;
  email: string;
}

export function CustomMongoDBAdapter(
  client: Promise<import("mongodb").MongoClient>
): Adapter {
  const adapter = MongoDBAdapter(clientPromise, {
    databaseName: "superapp",
  }) as Required<ReturnType<typeof MongoDBAdapter>>;

  return {
    ...adapter,
    async getSessionAndUser(sessionToken) {
      const result = await adapter.getSessionAndUser(sessionToken);
      if (result) {
        const db = (await client).db("superapp");
        const userWithRole = await db
          .collection("users")
          .findOne({ _id: new ObjectId(result.user.id) });
        return {
          session: result.session,
          user: {
            ...result.user,
            role: userWithRole?.role || "visitor",
          },
        };
      }
      return null;
    },
    async deleteUser(userId) {
      const db = (await client).db("superapp");
      await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
      await adapter.deleteUser(userId); // Changed: don't return this value
    },
    async getUserByAccount(providerAccountId) {
      const user = (await adapter.getUserByAccount(
        providerAccountId
      )) as CustomAdapterUser | null;
      if (user) {
        const db = (await client).db("superapp");
        const userWithRole = await db
          .collection("users")
          .findOne({ email: user.email });
        user.role = userWithRole?.role || "visitor";
      }
      return user as CustomAdapterUser | null;
    },
    async getUserByEmail(email) {
      const user = (await adapter.getUserByEmail(
        email
      )) as CustomAdapterUser | null;
      if (user) {
        const db = (await client).db("superapp");
        const userWithRole = await db.collection("users").findOne({ email });
        user.role = userWithRole?.role || user?.role || "visitor";
        user.email = email;
      }
      return user as CustomAdapterUser | null;
    },
    // Override `getUser` to include the `role` field
    async getUser(id) {
      const user = (await adapter.getUser(id)) as CustomAdapterUser | null;
      if (user) {
        const db = (await client).db("superapp");
        const userWithRole = await db
          .collection("users")
          .findOne({ _id: new ObjectId(id) });
        user.role = userWithRole?.role || user?.role || "visitor";
      }
      return user as CustomAdapterUser | null;
    },

    // Override `createUser` to add a role to new users
    async createUser(data: AdapterUser) {
      const db = (await client).db("superapp");
      const newUser = { ...data, role: "visitor" }; // Set default role
      const { insertedId } = await db.collection("users").insertOne(newUser);
      const { id, ...userWithoutId } = newUser; // Remove any existing id
      return {
        id: insertedId.toString(),
        ...userWithoutId,
      } as CustomAdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const db = (await client).db("superapp");
      if ("role" in user && user.role) {
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(user.id) },
            { $set: { role: user.role } }
          );
      }
      const updatedUser = await adapter.updateUser(user);
      return {
        ...updatedUser,
        role: ("role" in user ? user.role : undefined) || "visitor",
      } as CustomAdapterUser;
    },
  };
}
