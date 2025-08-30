/**
 * Centralized validation constants for consistent validation across the application
 */

// Name validation regex that allows:
// - Unicode letters and marks (including accented characters)
// - Hyphens and apostrophes (for names like "Anne-Marie" or "O'Connor")
// - Spaces (but not at start/end)
// - 2-60 characters long
// Note: Uses ES2015+ Unicode property escapes
export const NAME_VALIDATION_REGEX =
  /^(?!\p{Zs})(?!.*\p{Zs}$)[-'\p{L}\p{M}\p{Zs}]{2,60}$/u;

// Email validation (more comprehensive than basic email)
export const EMAIL_VALIDATION_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation (international format)
export const PHONE_VALIDATION_REGEX = /^\+?\d{7,15}$/;

// Validation messages
export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  NAME_INVALID:
    "Name must be between 2-60 characters and contain only letters, spaces, hyphens and apostrophes",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Invalid email format",
  PHONE_REQUIRED: "Phone is required",
  PHONE_INVALID: "Invalid phone number",
} as const;
