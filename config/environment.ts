// Environment configuration utility
import Constants from "expo-constants";

// Define environment types
type Environment = "development" | "staging" | "production";

// Get the current environment from Expo Constants
const getEnvironment = (): Environment => {
  // You can customize this logic based on how you determine environments
  // For EAS builds, you can use the releaseChannel
  const releaseChannel =
    Constants.expoConfig?.extra?.releaseChannel || "development";

  if (releaseChannel.indexOf("prod") !== -1) return "production";
  if (releaseChannel.indexOf("staging") !== -1) return "staging";
  return "development";
};

// Get environment-specific variables
const getEnvironmentVariable = (name: string): string => {
  // First check for Expo constants (which includes environment variables in Expo Go)
  if (Constants.expoConfig?.extra && name in Constants.expoConfig.extra) {
    return Constants.expoConfig.extra[name];
  }

  // Then check for process.env (for Netlify and other build environments)
  if (typeof process !== "undefined" && process.env && name in process.env) {
    return process.env[name] as string;
  }

  // Fallback to checking global scope for variables (sometimes needed for web)
  if (typeof window !== "undefined" && (window as any)[name]) {
    return (window as any)[name];
  }

  // Finally, check for hardcoded values in Constants.manifest
  if (
    Constants.manifest &&
    Constants.manifest.extra &&
    name in Constants.manifest.extra
  ) {
    return Constants.manifest.extra[name];
  }

  return "";
};

// Get Convex URL with fallback for Netlify builds
const getConvexUrl = (): string => {
  const url = getEnvironmentVariable("EXPO_PUBLIC_CONVEX_URL");

  // Validate that we have a proper URL
  if (!url || url.trim() === "") {
    console.warn("EXPO_PUBLIC_CONVEX_URL is not set or empty");
    // Return a placeholder URL for build to succeed (will be replaced at runtime)
    return "https://example-convex-url.convex.cloud";
  }

  return url;
};

// Export configuration
export const Config = {
  environment: getEnvironment(),
  convexUrl: getConvexUrl(),
  clerkPublishableKey:
    getEnvironmentVariable("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY") ||
    "placeholder_clerk_key",
  paymongoSecretKey:
    getEnvironmentVariable("EXPO_PUBLIC_PAYMONGO_SECRET_KEY") || "",
};

export default Config;
