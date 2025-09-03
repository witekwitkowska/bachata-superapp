# Profile Page Components

This directory contains components for a beautiful, modern profile page built with shadcn/ui components.

## Components

### UserProfile
The main profile page component that displays user information, posts, and provides navigation between different views.

**Features:**
- Beautiful gradient banner with optional custom banner image
- User type badges (Artist, Organizer, Dancer, Admin)
- Profile statistics (posts, followers, following)
- Tabbed interface for posts and gallery views
- Responsive design with mobile-first approach

**Props:**
```typescript
interface UserProfileProps {
    profile: UserProfileType & {
        role?: string;
        isTeacher?: boolean;
        createdAt?: string;
        postsCount?: number;
        followersCount?: number;
        followingCount?: number;
    };
    posts: (Post & { 
        authorProfileImage: string; 
        authorName: string; 
        authorEmail: string;
    })[];
    currentUserId?: string;
    defaultTab?: string;
}
```

### PostGrid
A grid view component for displaying user posts as images with hover effects and modal details.

**Features:**
- Responsive grid layout (2-4 columns based on screen size)
- Hover effects with reaction counts overlay
- Multiple images indicator
- Modal popup for detailed post view
- Empty state handling

## User Types

The profile page automatically detects and displays user types with appropriate badges:

- **Artist** (pink badge with music icon) - Users with `isTeacher: true` or `role: "teacher"`
- **Organizer** (blue badge with users icon) - Users with `role: "organizer"`
- **Admin** (purple badge with star icon) - Users with `role: "admin"`
- **Dancer** (green badge with heart icon) - Default for regular users

## Usage

### Basic Usage
```tsx
import { UserProfile } from "@/components/profile/UserProfile";

<UserProfile 
    profile={userProfile}
    posts={userPosts}
    currentUserId={currentUser?.id}
    defaultTab="posts"
/>
```

### With API Integration
```tsx
// In your page component
const { data: profile } = await serverFetch(`/api/users/${userId}`);
const { data: posts } = await serverFetch(`/api/posts?authorId=${userId}`);

<UserProfile 
    profile={profile}
    posts={posts}
    currentUserId={session?.user?.id}
/>
```

## API Endpoints

The profile page expects these API endpoints:

- `GET /api/users/[id]` - Fetch user profile data
- `GET /api/posts?authorId=[id]` - Fetch user posts

## Styling

The components use:
- Tailwind CSS for styling
- shadcn/ui components for UI elements
- Gradient backgrounds and hover effects
- Responsive design patterns
- Glass morphism effects with backdrop blur

## Demo

Visit `/profile-demo` to see a working example with demo data.

## Integration with Posts

The profile page integrates seamlessly with the existing post system:
- Profile pictures in posts are clickable and link to user profiles
- Post cards are reused in the profile page
- Consistent styling and behavior across the app
