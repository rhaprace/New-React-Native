// This script ensures environment variables are properly set for Netlify builds
const fs = require("fs");
const path = require("path");

console.log("Setting up environment variables for Netlify build...");

// Get environment variables with validation
const getValidatedEnvVars = () => {
  const vars = {
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_PAYMONGO_SECRET_KEY:
      process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY,
  };

  // Log the values we got (safely)
  console.log("Raw environment variables:");
  Object.entries(vars).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? "✅ Set" : "❌ Not set"}`);
  });

  return vars;
};

// Create the environment.js file for the web build
const setupEnvironmentFile = () => {
  const envFilePath = path.join(__dirname, "..", "web", "environment.js");
  const vars = getValidatedEnvVars();

  // Create the environment.js content with direct values
  const envFileContent = `// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${vars.EXPO_PUBLIC_CONVEX_URL || ""}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${vars.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${vars.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || ""}";
`;

  // Write the file
  fs.writeFileSync(envFilePath, envFileContent);
  console.log(`Created environment file at: ${envFilePath}`);

  // Log environment variables status
  console.log("Environment variables status:");
  console.log(
    `- EXPO_PUBLIC_CONVEX_URL: ${vars.EXPO_PUBLIC_CONVEX_URL ? "Set ✅" : "Not set ❌"}`
  );
  console.log(
    `- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${vars.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set ✅" : "Not set ❌"}`
  );
  console.log(
    `- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${vars.EXPO_PUBLIC_PAYMONGO_SECRET_KEY ? "Set ✅" : "Not set ❌"}`
  );

  // Validate values
  if (!vars.EXPO_PUBLIC_CONVEX_URL || !vars.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error("❌ Required environment variables are missing!");
    process.exit(1); // Exit with error
  }
};

// Run the setup
setupEnvironmentFile();
console.log("Environment setup completed.");
