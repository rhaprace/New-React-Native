import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

// Clerk token cache keys
const CLERK_TOKEN_CACHE_KEYS = [
  "clerk-js-session-token",
  "clerk-js-session-token-exp",
  "clerk-js-user-object",
  "clerk-js-device-id",
  "clerk-js-last-used-organization-id",
  "clerk-js-last-used-organization-slug",
];

/**
 * Cleans up all auth-related data during sign-out
 * This helps ensure a complete sign-out experience
 */
export const cleanupAuthData = async (): Promise<void> => {
  try {
    // 1. Try to clear Clerk token cache using the tokenCache.clear method if available
    try {
      if (
        tokenCache &&
        tokenCache.clearToken &&
        typeof tokenCache.clearToken === "function"
      ) {
        await Promise.all(
          CLERK_TOKEN_CACHE_KEYS.map((key) => tokenCache?.clearToken?.(key))
        );
        console.log("Clerk token cache cleared using tokenCache.clearToken()");
      } else {
        // Fallback: manually clear known Clerk token keys from AsyncStorage
        console.log("tokenCache.clear is not available, using manual cleanup");
        await Promise.all(
          CLERK_TOKEN_CACHE_KEYS.map((key) => AsyncStorage.removeItem(key))
        );
        console.log("Manually cleared Clerk token keys from AsyncStorage");
      }
    } catch (tokenError) {
      console.error("Error clearing token cache:", tokenError);
      // Continue with other cleanup steps
    }

    // 2. Clear app-specific data that should be removed on sign-out
    const keysToRemove = [
      // Add any app-specific keys that should be cleared on sign-out
      "atle_step_data",
      "health_connect_availability",
      "STORAGE_PERMISSION_GRANTED",
      // Add other keys as needed
    ];

    await Promise.all(keysToRemove.map((key) => AsyncStorage.removeItem(key)));

    console.log("Auth data cleanup completed successfully");
  } catch (error) {
    console.error("Error during auth data cleanup:", error);
    // Don't throw - we want to continue with sign-out even if cleanup fails
  }
};
