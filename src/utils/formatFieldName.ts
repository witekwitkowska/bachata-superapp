/**
 * Converts camelCase field names to Title Case display names
 * with special handling for common field patterns
 */
export function formatFieldName(field: string): string {
  // Handle special cases first
  const specialCases: Record<string, string> = {
    // ID fields
    locationId: "Location",
    organizerId: "Organizer",
    teacherId: "Teacher",
    studentId: "Student",
    companyId: "Company",

    // Count/Max fields
    maxAttendees: "Max Attendees",
    maxStudents: "Max Students",
    enrolledStudents: "Enrolled Students",

    // Array fields
    attendeeIds: "Attendees",
    focusAreas: "Focus Areas",
    accommodationOptions: "Accommodation Options",
    materials: "Materials",
    prerequisites: "Prerequisites",
    performers: "Performers",

    // Date fields
    startDate: "Start Date",
    endDate: "End Date",

    // Boolean fields
    isPaid: "Paid Event",
    includesFood: "Includes Food",
    includesDrinks: "Includes Drinks",
    published: "Published",

    // Other special cases
    musicStyle: "Music Style",
    dressCode: "Dress Code",
    skillLevel: "Skill Level",
    schedule: "Schedule",
    notes: "Notes",
    duration: "Duration (minutes)",
    coordinates: "Coordinates",
  };

  // Return special case if it exists
  if (specialCases[field]) {
    return specialCases[field];
  }

  // Convert camelCase to Title Case for unknown fields
  return field
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
}
