// Utility functions for progress tracking and state management

/**
 * Generic function to update progress items in an array by index
 * @param currentProgress - The current array of progress items
 * @param index - The index of the item to update
 * @param updates - Partial updates to apply to the item
 * @returns New array with the updated item
 */
export function updateProgressByIndex<T>(
  currentProgress: T[],
  index: number,
  updates: Partial<T>
): T[] {
  return currentProgress.map((item, i) =>
    i === index ? { ...item, ...updates } : item
  );
}

/**
 * Generic function to update progress items in an array by a key property
 * @param currentProgress - The current array of progress items
 * @param key - The key to match (e.g., 'file.key')
 * @param keyValue - The value to match against the key
 * @param updates - Partial updates to apply to the matched item
 * @returns New array with the updated item
 */
export function updateProgressByKey<T>(
  currentProgress: T[],
  key: keyof T,
  keyValue: unknown,
  updates: Partial<T>
): T[] {
  return currentProgress.map((item) =>
    item[key] === keyValue ? { ...item, ...updates } : item
  );
}

/**
 * Generic function to update progress items in an array using a predicate function
 * @param currentProgress - The current array of progress items
 * @param predicate - Function that returns true for items to update
 * @param updates - Partial updates to apply to matched items
 * @returns New array with updated items
 */
export function updateProgressByPredicate<T>(
  currentProgress: T[],
  predicate: (item: T) => boolean,
  updates: Partial<T>
): T[] {
  return currentProgress.map((item) =>
    predicate(item) ? { ...item, ...updates } : item
  );
}
