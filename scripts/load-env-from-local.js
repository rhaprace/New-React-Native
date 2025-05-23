// This script loads environment variables from .env.local and sets them in process.env
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

console.log("Loading environment variables from .env.local...");

// Path to .env.local file
const envLocalPath = path.join(__dirname, "..", ".env.local");

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  // Read the file content directly to handle special characters properly
  const fileContent = fs.readFileSync(envLocalPath, "utf8");

  // Parse the file content line by line to handle special characters in values
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

  // Set each environment variable
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }

  // Special handling for Clerk key - ensure it's exactly as in the file
  if (fileContent.includes("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=")) {
    const match = fileContent.match(
      /EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=([^\n]*)/
    );
    if (match && match[1]) {
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = match[1].trim();
      console.log("✅ Clerk publishable key extracted directly from file");
    }
  }

  console.log("Environment variables loaded from .env.local:");
  console.log(
    `- EXPO_PUBLIC_CONVEX_URL: ${process.env.EXPO_PUBLIC_CONVEX_URL ? "Set" : "Not set"}`
  );
  console.log(
    `- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Not set"}`
  );
  console.log(
    `- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY ? "Set" : "Not set"}`
  );
} else {
  console.warn(
    "⚠️ .env.local file not found. Using environment variables from process.env."
  );
}

// Run the setup-env-for-netlify script to create the environment.js file
require("./setup-env-for-netlify");
