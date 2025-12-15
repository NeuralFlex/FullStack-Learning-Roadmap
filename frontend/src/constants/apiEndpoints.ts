// API Base URL and Endpoints Configuration
// All API endpoint strings are centralized here for easy maintenance and consistency

import { API_BASE_URL } from './env';

// Re-export for backward compatibility
export { API_BASE_URL };

export const API_ENDPOINTS = {
  // Media endpoints
  listFiles: '/media/files',
  uploadUrl: '/media/upload-url',
  downloadUrl: (key: string) => `/media/download-url/${encodeURIComponent(key)}`,
  deleteFile: (key: string) => `/media/files/${encodeURIComponent(key)}`,
} as const;
