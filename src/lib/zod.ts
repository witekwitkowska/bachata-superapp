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
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["visitor", "user", "team", "admin"]).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  companyId: z.string().optional(),
});

export const userEditSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  bio: z.string().optional(),
  location: z.string().optional(),
  // website: z.string().url().optional().or(z.literal("")),
  // bachataLevel: z
  //   .enum(["beginner", "intermediate", "advanced", "expert"])
  //   .optional(),
  // avatar: z.string().optional(),
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
