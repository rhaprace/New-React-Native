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

  // Get environment variables from process.env and clean them
  let convexUrl = (process.env.EXPO_PUBLIC_CONVEX_URL || "").trim();
  let clerkPublishableKey = (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "").trim();
  let paymongoSecretKey = (process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || "").trim();

  // Remove any quotes that might be surrounding the values
  convexUrl = convexUrl.replace(/^["'](.*)["']$/, "$1");
  clerkPublishableKey = clerkPublishableKey.replace(/^["'](.*)["']$/, "$1");
  paymongoSecretKey = paymongoSecretKey.replace(/^["'](.*)["']$/, "$1");

  // Log raw values for debugging (without revealing full values)
  console.log("Raw environment variables (first 10 chars):");
  console.log(`- EXPO_PUBLIC_CONVEX_URL raw: ${convexUrl.substring(0, 10)}...`);
  console.log(`- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY raw: ${clerkPublishableKey.substring(0, 10)}...`);

  // Create the environment.js content
  const envFileContent = `// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${convexUrl}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${clerkPublishableKey}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${paymongoSecretKey}";
`;

  // Write the file
  fs.writeFileSync(envFilePath, envFileContent);
  console.log(`Created environment file at: ${envFilePath}`);

  // Log environment variables status
  console.log("Environment variables status:");
  console.log(`- EXPO_PUBLIC_CONVEX_URL: ${convexUrl ? `Set (starts with: ${convexUrl.substring(0, 10)}...)` : "Not set"} ${convexUrl ? "✅" : "⚠️"}`);
  console.log(`- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? `Set (starts with: ${clerkPublishableKey.substring(0, 10)}...)` : "Not set"} ${clerkPublishableKey ? "✅" : "⚠️"}`);
  console.log(`- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${paymongoSecretKey ? "Set" : "Not set"}`);

  return {
    convexUrl,
    clerkPublishableKey,
    paymongoSecretKey,
  };
};

// Run the setup
const envVars = setupEnvironmentFile();
console.log("Environment setup completed.");
