// This script loads environment variables from .env.local and sets them in process.env
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

console.log("Loading environment variables...");

// Path to .env.local file
const envLocalPath = path.join(__dirname, "..", ".env.local");

// Function to validate and set environment variables
const validateAndSetEnvVars = () => {
  const requiredVars = [
    "EXPO_PUBLIC_CONVEX_URL",
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "EXPO_PUBLIC_PAYMONGO_SECRET_KEY",
  ];

  // Check if variables are already set in process.env (from Netlify)
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length === 0) {
    console.log("✅ All required environment variables are set from process.env");
    return true;
  }

  // If not all variables are set, try to load from .env.local
  if (fs.existsSync(envLocalPath)) {
    const fileContent = fs.readFileSync(envLocalPath, "utf8");
    const lines = fileContent.split("\n");
    const envConfig = {};

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue;

      // Split by the first equals sign
      const equalIndex = line.indexOf("=");
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();

        // Remove quotes if present
        envConfig[key] = value.replace(/^["'](.*)["']$/, "$1");
      }
    }

    // Set environment variables from .env.local
    for (const key in envConfig) {
      if (!process.env[key]) {
        // Only set if not already set
        process.env[key] = envConfig[key];
      }
    }

    // Special handling for Clerk key
    if (fileContent.includes("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=")) {
      const match = fileContent.match(
        /EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=([^\n]*)/
      );
      if (
        match &&
        match[1] &&
        !process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
      ) {
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = match[1].trim();
      }
    }

    console.log("✅ Environment variables loaded from .env.local");
    return true;
  }

  console.log(
    "⚠️ .env.local file not found. Using environment variables from process.env."
  );

  // Check if we have the minimum required variables
  const stillMissingVars = requiredVars.filter((varName) => !process.env[varName]);
  if (stillMissingVars.length > 0) {
    console.warn("⚠️ Missing required environment variables:", stillMissingVars);
    return false;
  }

  return true;
};

// Run the validation and setup
const success = validateAndSetEnvVars();

if (success) {
  console.log("Environment variables setup completed successfully");
} else {
  console.error("Failed to set up all required environment variables");
  process.exit(1);
}

// Run the setup-env-for-netlify script to create the environment.js file
require("./setup-env-for-netlify");
