# CRUD API Route Generator

A powerful, configurable library for generating complete CRUD API routes in Next.js with built-in authentication, validation, and hooks.

## 🚀 Quick Start

```typescript
import { createCrudRoute } from "@/lib/api/crud-generator";

// Simple configuration
const userCrud = createCrudRoute({
  entity: "users",
  auth: true,
  schema: userSchema
});

// Use in your API route
export const GET = userCrud.GET;
export const POST = userCrud.POST;
```

## 📋 Features

- ✅ **Full CRUD Operations**: GET, POST, PATCH, DELETE
- ✅ **Authentication & Authorization**: Role-based access control
- ✅ **Data Validation**: Zod schema integration
- ✅ **Pagination**: Built-in pagination with customizable limits
- ✅ **Hooks System**: Pre/post processing hooks for all operations
- ✅ **Custom Filters**: Role-based data filtering
- ✅ **Response Transformation**: Customize response format
- ✅ **Error Handling**: Consistent error responses
- ✅ **MongoDB Integration**: Seamless MongoDB operations
- ✅ **TypeScript Support**: Full type safety

## 🔧 Configuration Options

### Basic Configuration

```typescript
interface CrudConfig {
  entity: string;                    // Collection name
  auth?: boolean;                    // Require authentication
  roles?: string[];                  // Allowed roles
  schema?: ZodTypeAny;              // Validation schema
  projection?: Record<string, any>;  // MongoDB projection
  sort?: Record<string, 1 | -1>;    // Default sorting
  limit?: number;                    // Default pagination limit
}
```

### Advanced Configuration

```typescript
interface CrudConfig {
  // ... basic options
  
  // Hooks
  beforeCreate?: (data: any, session: any) => Promise<any>;
  afterCreate?: (data: any, result: any) => Promise<void>;
  beforeUpdate?: (data: any, session: any, id: string) => Promise<any>;
  afterUpdate?: (data: any, result: any) => Promise<void>;
  beforeDelete?: (id: string, session: any) => Promise<boolean>;
  afterDelete?: (id: string) => Promise<void>;
  
  // Custom behavior
  customFilters?: (query: any, session: any) => Promise<any>;
  transformResponse?: (data: any) => any;
}
```

## 📝 Examples

### 1. Simple User Management

```typescript
// src/lib/api/examples/user-crud.ts
import { createCrudRoute } from "../crud-generator";
import { userSchema } from "@/lib/zod";

export const userCrud = createCrudRoute({
  entity: "users",
  auth: true,
  roles: ["admin", "user"],
  schema: userSchema,
  projection: { password: 0 }, // Exclude password
  sort: { createdAt: -1 }
});
```

### 2. Blog Posts with Custom Logic

```typescript
// src/lib/api/examples/post-crud.ts
export const postCrud = createCrudRoute({
  entity: "posts",
  auth: true,
  schema: postSchema,
  
  // Custom filters - show published posts to everyone
  customFilters: async (query, session) => {
    if (session?.user?.role !== "admin") {
      query.$or = [
        { published: true },
        { createdBy: session.user.id, published: false }
      ];
    }
    return query;
  },
  
  // Auto-assign author on creation
  beforeCreate: async (data, session) => {
    data.author = session.user.name;
    data.authorId = session.user.id;
    return data;
  }
});
```

### 3. Public Read-Only Data

```typescript
// src/lib/api/examples/public-crud.ts
export const publicCrud = createCrudRoute({
  entity: "articles",
  auth: false, // No authentication required
  schema: articleSchema,
  sort: { publishedAt: -1 },
  limit: 25
});
```

## 🛣️ API Route Setup

### Main Route (`/api/users/route.ts`)

```typescript
import { userCrud } from "@/lib/api/examples/user-crud";

export const GET = userCrud.GET;   // GET /api/users
export const POST = userCrud.POST;  // POST /api/users
```

### Dynamic Route (`/api/users/[id]/route.ts`)

```typescript
import { userCrud } from "@/lib/api/examples/user-crud";

export const GET = userCrud.GET_BY_ID;    // GET /api/users/123
export const PATCH = userCrud.PATCH;      // PATCH /api/users/123
export const DELETE = userCrud.DELETE;    // DELETE /api/users/123
```

## 🔐 Authentication & Authorization

### Role-Based Access Control

```typescript
const config = {
  entity: "sensitive-data",
  auth: true,
  roles: ["admin"], // Only admins can access
  
  // Custom authorization logic
  beforeCreate: async (data, session) => {
    if (session.user.role !== "admin") {
      throw new Error("Insufficient permissions");
    }
    return data;
  }
};
```

### User-Specific Data

```typescript
const config = {
  entity: "user-profiles",
  auth: true,
  
  // Users can only see their own data
  customFilters: async (query, session) => {
    query.userId = session.user.id;
    return query;
  }
};
```

## 📊 Pagination & Filtering

### Query Parameters

```
GET /api/users?page=2&limit=10&sort=name&order=asc
```

### Custom Filters

```typescript
customFilters: async (query, session) => {
  // Add search functionality
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Add date range filtering
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return query;
}
```

## 🎣 Hooks System

### Pre-Processing Hooks

```typescript
beforeCreate: async (data, session) => {
  // Validate business rules
  if (data.role === "admin" && session.user.role !== "super-admin") {
    throw new Error("Cannot create admin users");
  }
  
  // Transform data
  data.email = data.email.toLowerCase();
  
  return data;
}
```

### Post-Processing Hooks

```typescript
afterCreate: async (data, result) => {
  // Send welcome email
  await sendWelcomeEmail(data.email);
  
  // Log activity
  await logActivity("user_created", result.insertedId);
}
```

## 🔄 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "message": "Users retrieved successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🚨 Error Handling

The generator automatically handles:

- **Validation Errors**: Zod schema validation failures
- **Authentication Errors**: Unauthorized access attempts
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: MongoDB operation failures
- **Custom Errors**: Errors thrown in hooks

## 🎯 Best Practices

1. **Use Schemas**: Always define Zod schemas for validation
2. **Implement Hooks**: Use hooks for business logic, not in API routes
3. **Role-Based Access**: Define clear role hierarchies
4. **Custom Filters**: Implement proper data filtering for security
5. **Response Transformation**: Keep API responses consistent
6. **Error Logging**: Log errors for debugging and monitoring

## 🔧 Advanced Usage

### Custom Collection Logic

```typescript
const config = {
  entity: "complex-data",
  
  // Override default collection logic
  getCollection: async () => {
    const { db } = await connectToDatabase();
    return db.collection("complex-data").aggregate([
      // Custom aggregation pipeline
    ]);
  }
};
```

### Multiple Entity Support

```typescript
const config = {
  entity: "multi-tenant-data",
  
  customFilters: async (query, session) => {
    // Filter by tenant
    query.tenantId = session.user.tenantId;
    return query;
  }
};
```

## 📚 Migration Guide

### From Manual API Routes

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection("users");
    const users = await collection.find({}).toArray();
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

**After:**
```typescript
import { userCrud } from "@/lib/api/examples/user-crud";
export const GET = userCrud.GET;
```

## 🤝 Contributing

This library is designed to be extensible. Common extension points:

- Custom authentication methods
- Additional database adapters
- Enhanced filtering capabilities
- Custom response formats
- Additional hook types

## 📄 License

MIT License - feel free to use and modify for your projects!
