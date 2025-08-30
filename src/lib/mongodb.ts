import { MongoClient, MongoClientOptions, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// MongoDB URI (replace with your actual MongoDB URI)
const uri = process.env.MONGODB_URI;

// MongoDB connection options with SSL configuration
const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true, // Allow invalid certificates in development
  tlsAllowInvalidHostnames: true, // Allow invalid hostnames in development
  retryWrites: true,
  w: "majority" as const,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000, // Increased timeout
  retryReads: true,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
  directConnection: false, // Use connection pooling
};

// Create a MongoClient instance with retry logic
let clientPromise: Promise<MongoClient>;
export let client: MongoClient;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function createClient() {
  try {
    const mongoClient = new MongoClient(uri);
    await mongoClient.connect();

    return mongoClient;
  } catch (error) {
    // In development, try without TLS if TLS fails
    if (process.env.NODE_ENV === "development") {
      try {
        const fallbackOptions: MongoClientOptions = {
          retryWrites: true,
          w: "majority" as const,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 15000,
          retryReads: true,
          maxIdleTimeMS: 30000,
          heartbeatFrequencyMS: 10000,
          directConnection: false,
        };

        const fallbackClient = new MongoClient(uri);
        await fallbackClient.connect();

        return fallbackClient;
      } catch (fallbackError) {
        throw error; // Throw original error
      }
    }

    throw error;
  }
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to keep the MongoClient instance persistent
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = (async () => {
    try {
      const mongoClient = new MongoClient(uri);
      await mongoClient.connect();

      return mongoClient;
    } catch (error) {
      throw error;
    }
  })();
}

// clientPromise returns the MongoClient instance wrapped in a promise
export default clientPromise;

// Helper function to connect to database
export async function connectToDatabase(): Promise<{
  db: Db;
  client: MongoClient;
}> {
  const client = await clientPromise;
  const db = client.db("superapp");
  return { db, client };
}
