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
