import { format } from "date-fns";
import { Event } from "@/types/event.types";

export const formatEventTime = (time: Date | string) => {
  const eventTime = new Date(time);
  return {
    date: format(eventTime, "EEEE, MMMM do, yyyy"),
    time: format(eventTime, "h:mm a"),
  };
};

export const generateGoogleMapsLink = (
  coordinates: { lat: number; lng: number },
  locationName?: string
) => {
  const { lat, lng } = coordinates;
  const query = locationName
    ? encodeURIComponent(locationName)
    : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export const formatEventDuration = (
  event: Event,
  startDate: Date,
  endDate: Date
) => {
  if (event.type === "private-session" && "duration" in event) {
    return `${event.duration} minutes`;
  }
  if (event.type === "festival" && "startDate" in event && "endDate" in event) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  return "2-3 hours"; // Default for social events and workshops
};

export const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "social":
      return "Users";
    case "festival":
      return "Music";
    case "workshop":
      return "BookOpen";
    case "private-session":
      return "User";
    default:
      return "Calendar";
  }
};

export const getEventTypeColor = (type: string) => {
  switch (type) {
    case "social":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "festival":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "workshop":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "private-session":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};
