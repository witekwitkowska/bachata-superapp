export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  bachataLevel?: string;
  location?: string;
  website?: string;
  gallery?: string[];
  banners?: string[];
  avatars?: string[];
  videoLinks?: string[];
  avatarX?: number; // X position for avatar object-position (0-100)
  avatarY?: number; // Y position for avatar object-position (0-100)
  bannerX?: number; // X position for banner object-position (0-100) - DEPRECATED: use bannerPositions
  bannerY?: number; // Y position for banner object-position (0-100) - DEPRECATED: use bannerPositions
  bannerPositions?: Array<{ x: number; y: number }>; // Positions for each banner image
  isPublic?: boolean;
  role?: string;
  isTeacher?: boolean;
  status?: "active" | "inactive" | "suspended";
  createdAt?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}
