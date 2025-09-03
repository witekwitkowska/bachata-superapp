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
  isPublic?: boolean;
  role?: string;
  isTeacher?: boolean;
  createdAt?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}
