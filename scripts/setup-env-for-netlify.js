// This script ensures environment variables are properly set for Netlify builds
const fs = require("fs");
const path = require("path");

console.log("Setting up environment variables for Netlify build...");

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Validate Clerk publishable key format
const isValidClerkKey = (key) => {
  return key && key.startsWith("pk_");
};

// Create a simple environment.js file that will be included in the build
// This file will contain the environment variables needed for the app to run
const setupEnvironmentFile = () => {
  const envFilePath = path.join(__dirname, "..", "web", "environment.js");

  // Get environment variables from process.env
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "";
  const clerkPublishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const paymongoSecretKey = process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || "";

  // Validate environment variables
  const isConvexUrlValid = isValidUrl(convexUrl);
  const isClerkKeyValid = isValidClerkKey(clerkPublishableKey);

  // Create content for the environment.js file
  const content = `
// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${convexUrl}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${clerkPublishableKey}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${paymongoSecretKey}";

// Log environment variables status on page load
console.log("Environment variables loaded from environment.js:");
console.log("- EXPO_PUBLIC_CONVEX_URL: ${convexUrl ? "Set (starts with: " + convexUrl.substring(0, 10) + "...)" : "Not set"}");
console.log("- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? "Set (starts with: " + clerkPublishableKey.substring(0, 10) + "...)" : "Not set"}");
`;

  // Ensure the web directory exists
  const webDir = path.dirname(envFilePath);
  if (!fs.existsSync(webDir)) {
    fs.mkdirSync(webDir, { recursive: true });
    console.log(`Created directory: ${webDir}`);
  }

  // Write the file
  fs.writeFileSync(envFilePath, content);
  console.log(`Created environment file at: ${envFilePath}`);

  // Log environment variable status (without revealing full values)
  console.log("Environment variables status:");
  console.log(
    `- EXPO_PUBLIC_CONVEX_URL: ${convexUrl ? "Set (starts with: " + convexUrl.substring(0, 10) + "...)" : "Not set"} ${isConvexUrlValid ? "✅" : "❌"}`
  );
  console.log(
    `- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? "Set (starts with: " + clerkPublishableKey.substring(0, 10) + "...)" : "Not set"} ${isClerkKeyValid ? "✅" : "❌"}`
  );
  console.log(
    `- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${paymongoSecretKey ? "Set" : "Not set"}`
  );

  // Print warnings for invalid values
  if (!isConvexUrlValid) {
    console.warn(
      "⚠️ WARNING: EXPO_PUBLIC_CONVEX_URL is not a valid URL. Please check your environment variables."
    );
  }

  if (!isClerkKeyValid) {
    console.warn(
      '⚠️ WARNING: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not valid. It should start with "pk_". Please check your environment variables.'
    );
  }
};

// Run the setup
setupEnvironmentFile();
console.log("Environment setup completed.");
