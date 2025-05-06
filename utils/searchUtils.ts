/**
 * Normalizes a string by converting to lowercase and removing non-alphanumeric characters
 * @param text The string to normalize
 * @returns Normalized string
 */
export const normalizeText = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Checks if a string is an exact match to another string (case-insensitive)
 * @param text The text to check
 * @param compareText The text to compare against
 * @returns True if the strings match exactly (ignoring case)
 */
export const isExactMatch = (text: string, compareText: string): boolean => {
  return text.toLowerCase() === compareText.toLowerCase();
};

/**
 * Checks if a string is a fuzzy match to another string
 * @param text The text to check
 * @param compareText The text to compare against
 * @returns True if the strings match fuzzily
 */
export const isFuzzyMatch = (text: string, compareText: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedCompareText = normalizeText(compareText);
  
  return (
    normalizedText.includes(normalizedCompareText) ||
    normalizedCompareText.includes(normalizedText)
  );
};

/**
 * Finds an exact match in an array of objects
 * @param items Array of objects to search
 * @param searchText Text to search for
 * @param property Property of the object to compare against
 * @returns The first matching object or undefined
 */
export const findExactMatch = <T>(
  items: T[] | undefined,
  searchText: string,
  property: keyof T
): T | undefined => {
  if (!items || items.length === 0) return undefined;
  
  return items.find((item) => {
    const itemValue = item[property];
    return typeof itemValue === 'string' && isExactMatch(itemValue, searchText);
  });
};

/**
 * Finds a fuzzy match in an array of objects
 * @param items Array of objects to search
 * @param searchText Text to search for
 * @param property Property of the object to compare against
 * @returns The first matching object or undefined
 */
export const findFuzzyMatch = <T>(
  items: T[] | undefined,
  searchText: string,
  property: keyof T
): T | undefined => {
  if (!items || items.length === 0 || searchText.length < 2) return undefined;
  
  return items.find((item) => {
    const itemValue = item[property];
    return typeof itemValue === 'string' && isFuzzyMatch(itemValue, searchText);
  });
};
