# 🚀 CRUD Generator Quick Start

## Basic Usage

### 1. Create a CRUD Configuration

```typescript
// src/lib/api/examples/my-entity.ts
import { createCrudRoute } from "../crud-generator";
import { z } from "zod";

const myEntitySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  active: z.boolean().default(true)
});

export const myEntityCrud = createCrudRoute({
  entity: "my-entities",        // MongoDB collection name
  auth: true,                   // Require authentication
  roles: ["admin", "user"],     // Allowed roles
  schema: myEntitySchema,       // Zod validation schema
  projection: { password: 0 },  // Exclude sensitive fields
  sort: { createdAt: -1 as const }, // Sort by creation date
  limit: 20                     // Default pagination limit
});
```

### 2. Create API Routes

**Main Route** (`/api/my-entities/route.ts`):
```typescript
import { myEntityCrud } from "@/lib/api/examples/my-entity";

export const GET = myEntityCrud.GET;   // GET /api/my-entities
export const POST = myEntityCrud.POST;  // POST /api/my-entities
```

**Dynamic Route** (`/api/my-entities/[id]/route.ts`):
```typescript
import { myEntityCrud } from "@/lib/api/examples/my-entity";

export const GET = myEntityCrud.GET_BY_ID;    // GET /api/my-entities/123
export const PATCH = myEntityCrud.PATCH;      // PATCH /api/my-entities/123
export const DELETE = myEntityCrud.DELETE;    // DELETE /api/my-entities/123
```

## 🔐 Authentication & Authorization

### Public Route (No Auth)
```typescript
export const publicCrud = createCrudRoute({
  entity: "public-data",
  auth: false,  // No authentication required
  schema: publicSchema
});
```

### Admin-Only Route
```typescript
export const adminCrud = createCrudRoute({
  entity: "admin-data",
  auth: true,
  roles: ["admin"],  // Only admins can access
  schema: adminSchema
});
```

### Role-Based Data Filtering
```typescript
export const userDataCrud = createCrudRoute({
  entity: "user-data",
  auth: true,
  roles: ["admin", "user"],
  
  // Users can only see their own data
  customFilters: async (query, session) => {
    if ((session?.user as any)?.role !== "admin") {
      query.userId = (session.user as any).id;
    }
    return query;
  }
});
```

## 🎣 Hooks System

### Pre-Processing Hooks
```typescript
export const crudWithHooks = createCrudRoute({
  entity: "items",
  auth: true,
  schema: itemSchema,
  
  // Before creating an item
  beforeCreate: async (data, session) => {
    // Auto-assign user
    data.createdBy = (session.user as any).id;
    data.createdAt = new Date();
    
    // Validate business rules
    if (data.priority === "high" && (session.user as any).role !== "admin") {
      throw new Error("Only admins can create high priority items");
    }
    
    return data;
  },
  
  // Before updating an item
  beforeUpdate: async (data, session, id) => {
    // Check ownership
    if ((session.user as any).role !== "admin") {
      const { connectToDatabase } = await import("@/lib/mongodb");
      const { db } = await connectToDatabase();
      const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
      
      if (!item || item.createdBy !== (session.user as any).id) {
        throw new Error("Can only update your own items");
      }
    }
    
    return data;
  }
});
```

### Post-Processing Hooks
```typescript
export const crudWithPostHooks = createCrudRoute({
  entity: "notifications",
  auth: true,
  schema: notificationSchema,
  
  // After creating a notification
  afterCreate: async (data, result) => {
    // Send real-time notification
    await sendWebSocketNotification(result.insertedId);
    
    // Log activity
    await logActivity("notification_created", result.insertedId);
  },
  
  // After deleting a notification
  afterDelete: async (id) => {
    // Clean up related data
    await cleanupNotificationData(id);
  }
});
```

## 📊 Pagination & Filtering

### Query Parameters
```
GET /api/items?page=2&limit=10
```

### Custom Filters
```typescript
export const searchableCrud = createCrudRoute({
  entity: "searchable-items",
  auth: true,
  schema: searchableSchema,
  
  customFilters: async (query, session) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    return query;
  }
});
```

## 🔄 Response Transformation

### Custom Response Format
```typescript
export const transformedCrud = createCrudRoute({
  entity: "complex-items",
  auth: true,
  schema: complexSchema,
  
  transformResponse: (data) => ({
    id: data._id.toString(),
    name: data.name,
    // Calculate derived fields
    isActive: data.status === 'active',
    age: data.createdAt ? Math.floor((Date.now() - data.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    // Format dates
    createdAt: data.createdAt?.toISOString(),
    updatedAt: data.updatedAt?.toISOString()
  })
});
```

## 🚨 Error Handling

The generator automatically handles:
- **Validation Errors**: Zod schema failures
- **Authentication Errors**: Unauthorized access
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: MongoDB operation failures
- **Custom Errors**: Errors thrown in hooks

### Custom Error Handling
```typescript
export const customErrorCrud = createCrudRoute({
  entity: "error-prone-items",
  auth: true,
  schema: errorProneSchema,
  
  beforeCreate: async (data, session) => {
    try {
      // Complex validation logic
      await validateBusinessRules(data);
      return data;
    } catch (error) {
      // Custom error with details
      throw new Error(`Business validation failed: ${error.message}`);
    }
  }
});
```

## 📝 Complete Example

Here's a complete working example:

```typescript
// src/lib/api/examples/blog-post.ts
import { createCrudRoute } from "../crud-generator";
import { z } from "zod";
import { ObjectId } from "mongodb";

const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export const blogPostCrud = createCrudRoute({
  entity: "blog-posts",
  auth: true,
  roles: ["admin", "author"],
  schema: blogPostSchema,
  sort: { updatedAt: -1 as const },
  limit: 10,
  
  // Authors can only see their own posts unless admin
  customFilters: async (query, session) => {
    if ((session?.user as any)?.role !== "admin") {
      query.$or = [
        { published: true },
        { authorId: (session.user as any).id, published: false }
      ];
    }
    return query;
  },
  
  // Auto-assign author
  beforeCreate: async (data, session) => {
    data.authorId = (session.user as any).id;
    data.authorName = (session.user as any).name;
    return data;
  },
  
  // Authors can only edit their own posts
  beforeUpdate: async (data, session, id) => {
    if ((session.user as any).role !== "admin") {
      const { connectToDatabase } = await import("@/lib/mongodb");
      const { db } = await connectToDatabase();
      const post = await db.collection("blog-posts").findOne({ _id: new ObjectId(id) });
      
      if (!post || post.authorId !== (session.user as any).id) {
        throw new Error("Can only edit your own posts");
      }
    }
    return data;
  },
  
  // Transform response
  transformResponse: (data) => ({
    id: data._id.toString(),
    title: data.title,
    content: data.content,
    published: data.published,
    tags: data.tags,
    author: data.authorName,
    createdAt: data.createdAt?.toISOString(),
    updatedAt: data.updatedAt?.toISOString()
  })
});
```

## 🎯 Best Practices

1. **Always use schemas** for data validation
2. **Implement proper authorization** in hooks
3. **Use custom filters** for data security
4. **Transform responses** for consistent API format
5. **Handle errors gracefully** in hooks
6. **Log important operations** in post-hooks
7. **Use TypeScript** for better type safety

## 🚀 That's It!

You now have a powerful, configurable CRUD API generator that handles:
- ✅ Authentication & authorization
- ✅ Data validation
- ✅ Pagination & filtering
- ✅ Hooks for business logic
- ✅ Response transformation
- ✅ Error handling
- ✅ MongoDB integration

Create your first CRUD route in minutes! 🎉
