
// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "https://example-convex-url.convex.cloud";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder_key";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "";

// Log environment variables status on page load
console.log("Environment variables loaded from environment.js:");
console.log("- EXPO_PUBLIC_CONVEX_URL: Set (starts with: https://ex...)");
console.log("- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Set (starts with: pk_test_pl...)");

// Validate environment variables on page load
try {
  // Validate Convex URL
  const isValidConvexUrl = Boolean(window.EXPO_PUBLIC_CONVEX_URL && new URL(window.EXPO_PUBLIC_CONVEX_URL));
  console.log("- CONVEX_URL valid: " + (isValidConvexUrl ? "✅" : "❌"));

  // Validate Clerk key
  const isValidClerkKey = Boolean(window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY && window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_"));
  console.log("- CLERK_KEY valid: " + (isValidClerkKey ? "✅" : "❌"));

  // Print the actual Clerk key for debugging (first 20 chars)
  console.log("DEBUG - Clerk key in browser: " + window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 20) + "...");

  // Show warnings for invalid values
  if (!isValidConvexUrl) {
    console.warn("⚠️ WARNING: EXPO_PUBLIC_CONVEX_URL is not a valid URL: " + window.EXPO_PUBLIC_CONVEX_URL);
  }

  if (!isValidClerkKey) {
    console.warn("⚠️ WARNING: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not valid (should start with pk_): " + window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
  }
} catch (error) {
  console.error("Error validating environment variables:", error);
}
