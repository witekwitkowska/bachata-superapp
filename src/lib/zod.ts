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
  name: z.string().min(1, "Location name is required").default(""),
  address: z.string().min(1, "Address is required").default(""),
  city: z.string().min(1, "City is required").default(""),
  country: z.string().min(1, "Country is required").default(""),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// Base Event Schema
export const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required").default(""),
  description: z.string().min(1, "Description is required").default(""),
  type: z.enum(["social", "festival", "private-session", "workshop"]),
  isPaid: z.boolean().default(false),
  locationId: z.string().min(1, "Location is required").default(""),
  price: z.number().min(0).default(0).optional(),
  currency: z.string().default("EUR").optional(),
  maxAttendees: z.number().min(1).optional(),
  published: z.boolean().default(false),
});

// Social Event Schema
export const socialEventSchema = baseEventSchema.extend({
  type: z.literal("social"),
  organizerId: z.string().min(1, "Organizer is required").default(""),
  weeklyDays: z
    .array(
      z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
    )
    .default([])
    .optional(),
  startDate: z.date().default(() => new Date()),
  endDate: z
    .date()
    .default(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year from now
  musicStyle: z.string().default("").optional(),
  dressCode: z.string().default("").optional(),
  includesFood: z.boolean().default(false).optional(),
  includesDrinks: z.boolean().default(false).optional(),
});

// Festival Event Schema
export const festivalEventSchema = baseEventSchema
  .extend({
    type: z.literal("festival"),
    organizerId: z.string().min(1, "Organizer is required").default(""),
    startDate: z.date().default(() => new Date()),
    endDate: z.date().default(() => new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
    attendeeIds: z.array(z.string()).default([]),
    performers: z
      .array(z.string())
      .min(1, "At least one performer is required")
      .default([]),
    schedule: z
      .array(
        z.object({
          day: z.number().default(1),
          events: z
            .array(
              z.object({
                time: z.string().default(""),
                title: z.string().default(""),
                description: z.string().default(""),
                performer: z.string().default("").optional(),
              })
            )
            .default([]),
        })
      )
      .optional()
      .default([]),
    accommodationOptions: z
      .array(
        z.object({
          name: z.string().default(""),
          price: z.number().default(0),
          description: z.string().default(""),
        })
      )
      .optional()
      .default([]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Private Session Schema
export const privateSessionSchema = baseEventSchema.extend({
  type: z.literal("private-session"),
  teacherId: z.string().min(1, "Teacher is required").default(""),
  studentId: z.string().min(1, "Student is required").default(""),
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .default(60),
  skillLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("beginner"),
  focusAreas: z.array(z.string()).default([]).optional(),
  notes: z.string().default("").optional(),
});

// Workshop Schema
export const workshopSchema = baseEventSchema.extend({
  type: z.literal("workshop"),
  teacherId: z.string().min(1, "Teacher is required").default(""),
  skillLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("beginner"),
  maxStudents: z
    .number()
    .min(1, "Maximum students must be at least 1")
    .default(20),
  enrolledStudents: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]).optional(),
  prerequisites: z.array(z.string()).default([]).optional(),
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
    recaptchaToken: z
      .string()
      .min(1, "Please complete the reCAPTCHA verification"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const userUpdateSchema = z.object({
  id: z.string().default(""),
  name: nameValidation,
  email: emailValidation,
  role: z.enum(["visitor", "user", "team", "admin"]).default("user").optional(),
  status: z
    .enum(["active", "inactive", "pending"])
    .default("active")
    .optional(),
  companyId: z.string().default("").optional(),
});

export const userEditImagesSchema = z.object({
  banners: z.array(z.string()).default([]).optional(),
  avatars: z.array(z.string()).default([]).optional(),
  gallery: z.array(z.string()).default([]).optional(),
});

export const userEditSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  bio: z.string().default("").optional(),
  location: z.string().default("").optional(),
  website: z.url().default("").optional(),
  bachataLevel: z.string().default("beginner").optional(),
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
