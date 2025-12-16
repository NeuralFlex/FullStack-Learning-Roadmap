/**
 * Parses a string into an integer with a fallback value.
 * @param input - The string to parse.
 * @param fallback - The fallback value if parsing fails or returns NaN.
 * @returns The parsed integer or the fallback value.
 */
export function parseIntWithFallback(input: string, fallback: number): number {
  return Number.parseInt(input, 10) || fallback;
}

/**
 * Parses a string into a float with a fallback value.
 * @param input - The string to parse.
 * @param fallback - The fallback value if parsing fails or returns NaN.
 * @returns The parsed float or the fallback value.
 */
export function parseFloatWithFallback(input: string, fallback: number): number {
  return Number.parseFloat(input) || fallback;
}

/**
 * Formats file size in human readable units.
 * @param bytes - The file size in bytes.
 * @returns The formatted file size with appropriate unit.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
