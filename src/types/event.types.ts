export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseEvent {
  id: string;
  title: string;
  description: string;
  time: Date;
  type: "social" | "festival" | "private-session" | "workshop";
  isPaid: boolean;
  locationId: string;
  location?: Location; // Populated during creation
  price?: number;
  currency?: string;
  maxAttendees?: number;
  published: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  images?: string[]; // Added for image support
  rating?: number; // Added for rating support
  teacher?: any; // Added for teacher reference
  startDate?: Date;
  endDate?: Date;
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
  tiktokLink?: string;
  websiteLink?: string;
  email?: string;
  phone?: string;
  videoLinks?: Array<{
    id: string;
    url: string;
    type: "youtube" | "instagram" | "unknown";
  }>;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialEvent extends BaseEvent {
  type: "social";
  organizerId: string;
  musicStyle?: string;
  dressCode?: string;
  includesFood?: boolean;
  includesDrinks?: boolean;
}

export interface Festival extends BaseEvent {
  type: "festival";
  organizerId: string;
  attendeeIds: string[];
  performers: string[];
  schedule?: Array<{
    day: number;
    events: Array<{
      time: string;
      title: string;
      description: string;
      performer?: string;
    }>;
  }>;
  accommodationOptions?: Array<{
    name: string;
    price: number;
    description: string;
  }>;
}

export interface PrivateSession extends BaseEvent {
  type: "private-session";
  teacherId: string;
  studentId: string;
  duration: number; // in minutes
  skillLevel: "beginner" | "intermediate" | "advanced";
  focusAreas?: string[];
  notes?: string;
}

export interface Workshop extends BaseEvent {
  type: "workshop";
  teacherId: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  maxStudents: number;
  enrolledStudents: string[];
  materials?: string[];
  prerequisites?: string[];
}

export type Event = SocialEvent | Festival | PrivateSession | Workshop;
