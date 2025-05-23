
// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "https://savory-coyote-898.convex.cloud";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_aW50aW1hdGUtbWFuYXRlZS05NS5jbGVyay5hY2NvdW50cy5kZXYk";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";

// Log environment variables status on page load
console.log("Environment variables loaded from environment.js:");
console.log("- EXPO_PUBLIC_CONVEX_URL: Set (starts with: https://sa...)");
console.log("- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Set (starts with: pk_test_aW...)");

// Validate environment variables on page load
try {
  // Validate Convex URL
  const isValidConvexUrl = Boolean(window.EXPO_PUBLIC_CONVEX_URL && new URL(window.EXPO_PUBLIC_CONVEX_URL));
  console.log("- CONVEX_URL valid: " + (isValidConvexUrl ? "✅" : "❌"));

  // Validate Clerk key
  const isValidClerkKey = Boolean(window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY && window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_"));
  console.log("- CLERK_KEY valid: " + (isValidClerkKey ? "✅" : "❌"));

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
