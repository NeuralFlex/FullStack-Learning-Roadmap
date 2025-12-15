// Media-related constants
// Centralized configuration for supported media file extensions

export const MEDIA_EXTENSIONS = [
  // Image formats
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  // Video formats
  'mp4',
  'mov',
  'avi',
  'webm'
] as const;

export type MediaExtension = typeof MEDIA_EXTENSIONS[number];
