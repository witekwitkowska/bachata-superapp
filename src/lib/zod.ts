import { z } from "zod";
import { string } from "zod";
import {
  NAME_VALIDATION_REGEX,
  PHONE_VALIDATION_REGEX,
  VALIDATION_MESSAGES,
} from "./validation-constants";

// Common validation schemas for reuse across forms
export const nameValidation = string()
  .min(1, VALIDATION_MESSAGES.NAME_REQUIRED)
  .regex(NAME_VALIDATION_REGEX, VALIDATION_MESSAGES.NAME_INVALID);

export const emailValidation = string()
  .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED)
  .email(VALIDATION_MESSAGES.EMAIL_INVALID);

export const phoneValidation = string()
  .min(1, VALIDATION_MESSAGES.PHONE_REQUIRED)
  .regex(PHONE_VALIDATION_REGEX, VALIDATION_MESSAGES.PHONE_INVALID);

// Location Schema
export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// Base Event Schema
export const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  time: z.date(),
  type: z.enum(["social", "festival", "private-session", "workshop"]),
  isPaid: z.boolean(),
  locationId: z.string().min(1, "Location is required"),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  maxAttendees: z.number().min(1).optional(),
  published: z.boolean().default(false),
});

// Social Event Schema
export const socialEventSchema = baseEventSchema.extend({
  type: z.literal("social"),
  organizerId: z.string().min(1, "Organizer is required"),
  musicStyle: z.string().optional(),
  dressCode: z.string().optional(),
  includesFood: z.boolean().optional(),
  includesDrinks: z.boolean().optional(),
});

// Festival Event Schema
export const festivalEventSchema = baseEventSchema
  .extend({
    type: z.literal("festival"),
    organizerId: z.string().min(1, "Organizer is required"),
    startDate: z.date(),
    endDate: z.date(),
    attendeeIds: z.array(z.string()).default([]),
    performers: z
      .array(z.string())
      .min(1, "At least one performer is required"),
    schedule: z
      .array(
        z.object({
          day: z.number(),
          events: z.array(
            z.object({
              time: z.string(),
              title: z.string(),
              description: z.string(),
              performer: z.string().optional(),
            })
          ),
        })
      )
      .optional(),
    accommodationOptions: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          description: z.string(),
        })
      )
      .optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Private Session Schema
export const privateSessionSchema = baseEventSchema.extend({
  type: z.literal("private-session"),
  teacherId: z.string().min(1, "Teacher is required"),
  studentId: z.string().min(1, "Student is required"),
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  focusAreas: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Workshop Schema
export const workshopSchema = baseEventSchema.extend({
  type: z.literal("workshop"),
  teacherId: z.string().min(1, "Teacher is required"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  maxStudents: z.number().min(1, "Maximum students must be at least 1"),
  enrolledStudents: z.array(z.string()).default([]),
  materials: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
});

// Union type for all events
export const eventSchema = z.discriminatedUnion("type", [
  socialEventSchema,
  festivalEventSchema,
  privateSessionSchema,
  workshopSchema,
]);

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const userUpdateSchema = z.object({
  id: z.string(),
  name: nameValidation,
  email: emailValidation,
  role: z.enum(["visitor", "user", "team", "admin"]).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  companyId: z.string().optional(),
});

export const userEditImagesSchema = z.object({
  banners: z.array(z.string()).optional(),
  avatars: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
});

export const userEditSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.url().optional(),
  bachataLevel: z.string().optional(),
  // avatar: z.string().optional(),
  //date of birth
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
