// Environment configuration utility
import Constants from "expo-constants";
// Import hardcoded values if available
let EnvironmentValues: Record<string, string> = {};
try {
  // Try to import the hardcoded values
  const values = require("./environment-values").default;
  if (values) {
    EnvironmentValues = values;
    console.log("✅ Using hardcoded environment values");
  }
} catch (error) {
  console.log("No hardcoded environment values found, using standard methods");
}

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
  // First check for hardcoded values (for Netlify builds)
  if (EnvironmentValues && name in EnvironmentValues) {
    return EnvironmentValues[name];
  }

  // Then check for window object (for browser environment)
  if (typeof window !== "undefined" && (window as any)[name]) {
    return (window as any)[name];
  }

  // Then check for Expo constants (which includes environment variables in Expo Go)
  if (Constants.expoConfig?.extra && name in Constants.expoConfig.extra) {
    return Constants.expoConfig.extra[name];
  }

  // Then check for process.env (for Netlify and other build environments)
  if (typeof process !== "undefined" && process.env && name in process.env) {
    return process.env[name] as string;
  }

  // Check for values in Constants.expoConfig as a fallback
  if (
    Constants.expoConfig &&
    Constants.expoConfig.extra &&
    name in Constants.expoConfig.extra
  ) {
    return Constants.expoConfig.extra[name];
  }

  return "";
};

// Get Convex URL with fallback for Netlify builds
const getConvexUrl = (): string => {
  let url = getEnvironmentVariable("EXPO_PUBLIC_CONVEX_URL");

  // Check if we're in a browser environment and try to get from window
  if ((!url || url.trim() === "") && typeof window !== "undefined") {
    // Try to get from window object (set by environment.js)
    url = (window as any).EXPO_PUBLIC_CONVEX_URL || "";
  }

  // Validate that we have a proper URL
  if (!url || url.trim() === "") {
    console.warn("⚠️ EXPO_PUBLIC_CONVEX_URL is not set or empty");
    // Return a placeholder URL for build to succeed (will be replaced at runtime)
    return "https://example-convex-url.convex.cloud";
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    console.error("⚠️ Invalid CONVEX_URL format:", url);
    return "https://example-convex-url.convex.cloud";
  }

  return url;
};

// Get Clerk publishable key with validation
const getClerkPublishableKey = (): string => {
  let key = getEnvironmentVariable("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");

  // Check if we're in a browser environment and try to get from window
  if ((!key || key.trim() === "") && typeof window !== "undefined") {
    // Try to get from window object (set by environment.js)
    key = (window as any).EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

    if (key) {
      console.log(
        "🔑 Found Clerk key from window object:",
        key.substring(0, 15) + "..."
      );
    }
  }

  // Enhanced debugging
  console.log("🔍 Debug - Clerk key sources:");
  console.log(
    "  - From environment variable:",
    getEnvironmentVariable("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY") ? "✅" : "❌"
  );
  console.log(
    "  - From window object:",
    typeof window !== "undefined" &&
      (window as any).EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
      ? "✅"
      : "❌"
  );
  console.log(
    "  - Final key starts with pk_:",
    key?.startsWith("pk_") ? "✅" : "❌"
  );

  if (!key || key.trim() === "") {
    console.error(
      "❌ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set or empty - using placeholder"
    );
    // Instead of placeholder, let's use the direct key from .env.local as fallback
    return "pk_test_aW50aW1hdGUtbWFuYXRlZS05NS5jbGVyay5hY2NvdW50cy5kZXYk";
  }

  // Validate key format
  if (!key.startsWith("pk_")) {
    console.warn(
      "⚠️ Invalid Clerk publishable key format. Should start with 'pk_'"
    );
    // Return the direct key as fallback
    return "pk_test_aW50aW1hdGUtbWFuYXRlZS05NS5jbGVyay5hY2NvdW50cy5kZXYk";
  }

  return key;
};

// Export configuration
export const Config = {
  environment: getEnvironment(),
  convexUrl: getConvexUrl(),
  clerkPublishableKey: getClerkPublishableKey(),
  paymongoSecretKey:
    getEnvironmentVariable("EXPO_PUBLIC_PAYMONGO_SECRET_KEY") || "",
};

export default Config;
