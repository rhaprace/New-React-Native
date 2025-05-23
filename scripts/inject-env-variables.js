// This script injects environment variables directly into the build process
const fs = require('fs');
const path = require('path');

console.log('Injecting environment variables directly into the build...');

// Create a direct injection of environment variables
const injectEnvironmentVariables = () => {
  // Create paths for the files we'll modify
  const envJsPath = path.join(__dirname, '..', 'web', 'environment.js');
  const configPath = path.join(__dirname, '..', 'config', 'environment-values.js');
  
  // These are the exact values from your Netlify dashboard
  // Replace these with your actual values from the Netlify dashboard
  const hardcodedValues = {
    // Use the exact values from your Netlify dashboard
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT || 'your-convex-deployment-id',
    EXPO_PRODUCTION_CONVEX_KEY: process.env.EXPO_PRODUCTION_CONVEX_KEY || 'your-convex-key',
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_your_clerk_key',
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL || 'https://your-convex-url.convex.cloud',
    EXPO_PUBLIC_PAYMONGO_SECRET_KEY: process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || 'your-paymongo-key'
  };
  
  // Create environment.js content for the browser
  const envJsContent = `
// This file is generated during the build process with hardcoded values
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${hardcodedValues.EXPO_PUBLIC_CONVEX_URL}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${hardcodedValues.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${hardcodedValues.EXPO_PUBLIC_PAYMONGO_SECRET_KEY}";
window.CONVEX_DEPLOYMENT = "${hardcodedValues.CONVEX_DEPLOYMENT}";
window.EXPO_PRODUCTION_CONVEX_KEY = "${hardcodedValues.EXPO_PRODUCTION_CONVEX_KEY}";

// Log environment variables status on page load
console.log("Environment variables directly injected from hardcoded values:");
console.log("- EXPO_PUBLIC_CONVEX_URL: Set (starts with: " + "${hardcodedValues.EXPO_PUBLIC_CONVEX_URL.substring(0, 10)}" + "...)");
console.log("- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Set (starts with: " + "${hardcodedValues.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10)}" + "...)");
`;

  // Create environment-values.js content for the build process
  const configContent = `
// This file is generated during the build process with hardcoded values
// It contains environment variables needed for the app to run

export const EnvironmentValues = {
  CONVEX_DEPLOYMENT: "${hardcodedValues.CONVEX_DEPLOYMENT}",
  EXPO_PRODUCTION_CONVEX_KEY: "${hardcodedValues.EXPO_PRODUCTION_CONVEX_KEY}",
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: "${hardcodedValues.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}",
  EXPO_PUBLIC_CONVEX_URL: "${hardcodedValues.EXPO_PUBLIC_CONVEX_URL}",
  EXPO_PUBLIC_PAYMONGO_SECRET_KEY: "${hardcodedValues.EXPO_PUBLIC_PAYMONGO_SECRET_KEY}"
};

export default EnvironmentValues;
`;

  // Ensure directories exist
  const webDir = path.dirname(envJsPath);
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(webDir)) {
    fs.mkdirSync(webDir, { recursive: true });
    console.log(`Created directory: ${webDir}`);
  }
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log(`Created directory: ${configDir}`);
  }
  
  // Write the files
  fs.writeFileSync(envJsPath, envJsContent);
  console.log(`Created environment.js file at: ${envJsPath}`);
  
  fs.writeFileSync(configPath, configContent);
  console.log(`Created environment-values.js file at: ${configPath}`);
  
  // Log environment variable status (without revealing full values)
  console.log('Environment variables directly injected:');
  Object.keys(hardcodedValues).forEach(key => {
    const value = hardcodedValues[key];
    console.log(`- ${key}: ${value ? 'Set (starts with: ' + value.substring(0, 10) + '...)' : 'Not set'}`);
  });
};

// Run the function
injectEnvironmentVariables();
console.log('Environment variable injection completed.');
