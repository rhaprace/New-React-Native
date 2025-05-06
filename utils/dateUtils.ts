/**
 * Formats a date string for display in a user-friendly way
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (Today, Yesterday, or Month Day)
 */
export const formatRelativeDate = (dateString: string): string => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split("T")[0];

  if (dateString === today) {
    return "Today";
  } else if (dateString === yesterdayString) {
    return "Yesterday";
  } else {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};
