export type VideoType = "youtube" | "instagram" | "unknown";

export interface VideoLink {
  id: string;
  url: string;
  type: VideoType;
}

/**
 * Converts an array of video URLs to VideoLink objects
 */
export function convertToVideoLinks(urls: string[]): VideoLink[] {
  return urls.map((url, index) => ({
    id: `video-${index}`,
    url,
    type: detectVideoType(url),
  }));
}

/**
 * Detects the type of video link
 */
export function detectVideoType(url: string): VideoType {
  if (!url) return "unknown";

  const lowerUrl = url.toLowerCase();

  // YouTube patterns
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return "youtube";
  }

  // Instagram patterns
  if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
    return "instagram";
  }

  return "unknown";
}

/**
 * Validates if a URL is a valid video link
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
    const type = detectVideoType(url);
    return type !== "unknown";
  } catch {
    return false;
  }
}

/**
 * Extracts video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extracts Instagram post ID from URL
 */
export function extractInstagramId(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([^\/\?]+)/,
    /instagram\.com\/reel\/([^\/\?]+)/,
    /instagram\.com\/tv\/([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Generates a unique ID for video links
 */
export function generateVideoLinkId(): string {
  return `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a new video link object
 */
export function createVideoLink(url: string): VideoLink {
  return {
    id: generateVideoLinkId(),
    url: url.trim(),
    type: detectVideoType(url),
  };
}

/**
 * Validates an array of video links
 */
export function validateVideoLinks(links: VideoLink[]): {
  valid: VideoLink[];
  invalid: VideoLink[];
} {
  const valid: VideoLink[] = [];
  const invalid: VideoLink[] = [];

  links.forEach((link) => {
    if (isValidVideoUrl(link.url)) {
      valid.push(link);
    } else {
      invalid.push(link);
    }
  });

  return { valid, invalid };
}
