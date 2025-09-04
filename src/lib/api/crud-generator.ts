import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

export interface CrudConfig<T = any> {
  entity: string;
  schema?: any;
  auth?: boolean;
  roles?: string[];
  projection?: Record<string, 0 | 1>;
  sort?: Record<string, 1 | -1>;
  customFilters?: (
    session: any,
    params?: URLSearchParams
  ) => Record<string, any> | Promise<Record<string, any>>;
  paramName?: string; // Custom parameter name for dynamic routes
  beforeCreate?: (data: T, session: any) => Promise<T> | T;
  beforeUpdate?: (
    data: Partial<T>,
    session: any,
    id: string
  ) => Promise<Partial<T>> | Partial<T>;
  beforeDelete?: (session: any, id: string) => Promise<boolean>;
  afterCreate?: (data: T, session: any) => Promise<void> | void;
  afterUpdate?: (
    data: Partial<T>,
    session: any,
    id: string
  ) => Promise<void> | void;
  afterDelete?: (id: string, session: any) => Promise<void> | void;
  exposeInternalCall?: boolean;
}

export async function checkAuth(config: CrudConfig, request?: NextRequest) {
  if (!config.auth || request?.method === "GET") return null;

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (
    !config.exposeInternalCall &&
    request?.headers.get("X-Internal-Call") === "true"
  ) {
    return session;
  }

  if (config.roles && !config.roles.includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}

export async function getCollection(entity: string) {
  const { connectToDatabase } = await import("@/lib/mongodb");
  const { db } = await connectToDatabase();
  return db.collection(entity);
}

export function transform<T>(data: T, config: CrudConfig): T {
  if (config.projection) {
    const transformed: Partial<T> = {};
    for (const key of Object.keys(data as Record<string, unknown>)) {
      if (key === "_id") {
        // Transform _id to id
        (transformed as any).id = String(
          (data as Record<string, unknown>)[key]
        );
        continue;
      }
      if (config.projection[key] !== 0) {
        transformed[key as keyof T] = (data as Record<string, unknown>)[
          key
        ] as T[keyof T];
      }
    }
    return transformed as T;
  }
  return data;
}

export function generateCrudRoutes<T = any>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const session = await checkAuth(config, request);
      const collection = await getCollection(config.entity);
      const filters = config.customFilters
        ? await config.customFilters(session, searchParams)
        : {};
      const sort = config.sort || { createdAt: -1 as const };

      console.log(filters, "filters");
      const documents = await collection.find(filters).sort(sort).toArray();

      const transformedDocs = documents.map((doc) => transform(doc, config));

      return Response.json({
        success: true,
        data: transformedDocs,
      });
    } catch (error) {
      return Response.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }
  };

  const GET_BY_ID = async (
    request: NextRequest,
    { params }: { params: Promise<{ [key: string]: string }> }
  ) => {
    try {
      console.log("GET_BY_ID route hit for entity:", config.entity);
      const session = await checkAuth(config, request);
      const collection = await getCollection(config.entity);

      const paramName = config.paramName || "id";
      const resolvedParams = await params;
      const id = resolvedParams[paramName];
      console.log(
        "GET_BY_ID - paramName:",
        paramName,
        "resolvedParams:",
        resolvedParams,
        "id:",
        id
      );

      const document = await collection.findOne({
        _id: new ObjectId(id),
      });
      if (!document) {
        return Response.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        data: transform(document, config),
      });
    } catch (error) {
      return Response.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }
  };

  const POST = async (request: NextRequest) => {
    try {
      const session = await checkAuth(config, request);
      const collection = await getCollection(config.entity);

      const body = await request.json();
      let data = body;

      if (config.beforeCreate) {
        data = await config.beforeCreate(body, session);
      }

      const result = await collection.insertOne(data);

      if (config.afterCreate) {
        await config.afterCreate(data, session);
      }

      return Response.json({
        success: true,
        data: { id: result.insertedId },
      });
    } catch (error) {
      return Response.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }
  };

  const PATCH = async (
    request: NextRequest,
    { params }: { params: Promise<{ [key: string]: string }> }
  ) => {
    try {
      const session = await checkAuth(config, request);
      const collection = await getCollection(config.entity);

      const paramName = config.paramName || "id";
      const id = (await params)[paramName];
      const body = await request.json();
      let data = body;

      if (config.beforeUpdate) {
        data = await config.beforeUpdate(body, session, id);
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );

      if (result.matchedCount === 0) {
        return Response.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      if (config.afterUpdate) {
        await config.afterUpdate(data, session, id);
      }

      return Response.json({ success: true, data: { id: id } });
    } catch (error) {
      console.log("error in PATCH", error);
      return Response.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }
  };

  const DELETE = async (
    request: NextRequest,
    { params }: { params: Promise<{ [key: string]: string }> }
  ) => {
    try {
      const session = await checkAuth(config, request);

      const paramName = config.paramName || "id";
      const id = (await params)[paramName];

      if (config.beforeDelete) {
        const canDelete = await config.beforeDelete(session, id);
        if (!canDelete) {
          return Response.json(
            { success: false, error: "Cannot delete this document" },
            { status: 403 }
          );
        }
      }

      const collection = await getCollection(config.entity);
      const result = await collection.deleteOne({
        _id: new ObjectId(String(id)),
      });

      if (result.deletedCount === 0) {
        return Response.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      if (config.afterDelete) {
        await config.afterDelete(id, session);
      }

      return Response.json({ success: true, data: { id: id } });
    } catch (error) {
      return Response.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }
  };

  return {
    GET,
    GET_BY_ID,
    POST,
    PATCH,
    DELETE,
  };
}

export function createCrudRoute(config: CrudConfig) {
  return generateCrudRoutes(config);
}
