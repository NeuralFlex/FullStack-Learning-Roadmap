// Environment configuration and constants
// Centralized environment variable handling and default values

/**
 * API Base URL configuration
 * Uses environment variable with localhost fallback for development
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Environment detection helpers
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * Environment-specific configurations
 */
export const config = {
  // API configuration
  api: {
    baseUrl: API_BASE_URL,
    timeout: 30000, // 30 seconds
  },

  // Feature flags
  features: {
    enableCaching: true,
    enableProgressTracking: true,
  },

  // Development helpers
  dev: {
    enableDebugLogs: isDevelopment,
    mockApiResponses: false,
  },
} as const;
