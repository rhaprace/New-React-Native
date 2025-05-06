/**
 * Standardizes day formatting across the application
 * Ensures the first letter is capitalized and the rest are lowercase
 * @param day The day string to format
 * @returns The formatted day string
 */
export const formatDay = (day: string): string => {
  if (!day) return '';

  // Normalize the day name by removing any extra spaces and converting to lowercase
  const normalizedDay = day.trim().toLowerCase();

  // Map of possible day variations to standard format
  const dayMap: Record<string, string> = {
    'mon': 'Monday',
    'monday': 'Monday',
    'tue': 'Tuesday',
    'tues': 'Tuesday',
    'tuesday': 'Tuesday',
    'wed': 'Wednesday',
    'weds': 'Wednesday',
    'wednesday': 'Wednesday',
    'thu': 'Thursday',
    'thur': 'Thursday',
    'thurs': 'Thursday',
    'thursday': 'Thursday',
    'fri': 'Friday',
    'friday': 'Friday',
    'sat': 'Saturday',
    'saturday': 'Saturday',
    'sun': 'Sunday',
    'sunday': 'Sunday',
  };

  // Check if the normalized day is in our map
  if (dayMap[normalizedDay]) {
    return dayMap[normalizedDay];
  }

  // If not in the map, use the standard capitalization approach
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

/**
 * Validates if a string is a valid day of the week
 * @param day The day string to validate
 * @returns True if the day is valid, false otherwise
 */
export const isValidDay = (day: string): boolean => {
  const validDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  return validDays.includes(day);
};

/**
 * Gets all days of the week in properly formatted form
 * @returns Array of formatted day strings
 */
export const getAllDays = (): string[] => {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
};
