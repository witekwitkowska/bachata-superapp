# Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=development
```

## Setup Steps

1. **Install Dependencies**: All required packages are already installed
2. **Configure MongoDB**: Update your MongoDB connection string
3. **Generate NextAuth Secret**: Run `openssl rand -base64 32` to generate a secret
4. **Google OAuth** (Optional): Set up Google OAuth in Google Cloud Console
5. **Start Development Server**: Run `npm run dev`

## Features

- ✅ **User Registration** with email/password
- ✅ **User Login** with credentials
- ✅ **Google OAuth** integration
- ✅ **Password Hashing** with bcrypt
- ✅ **JWT Sessions** for stateless authentication
- ✅ **Role-based Access Control** (visitor, user, team, admin)
- ✅ **MongoDB Integration** with custom adapter
- ✅ **Form Validation** with Zod schemas
- ✅ **Responsive UI** with Tailwind CSS

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Password change
- `GET /api/auth/session` - Get current session
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users` - Update user

## Database Collections

The system automatically creates these collections:
- `users` - User accounts and profiles
- `accounts` - OAuth provider accounts
- `sessions` - User sessions (if using database sessions)

## Usage

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }
  
  return <button onClick={() => login("email", "password")}>Login</button>;
}
```

## Security Features

- Password hashing with bcrypt
- JWT token validation
- Role-based access control
- Input validation with Zod
- CSRF protection via NextAuth
- Secure cookie handling
