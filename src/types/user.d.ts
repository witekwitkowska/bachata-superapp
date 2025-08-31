export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  bachataLevel?: string;
  location?: string;
  website?: string;
  gallery?: string[];
  banners?: string[];
  avatars?: string[];
}
