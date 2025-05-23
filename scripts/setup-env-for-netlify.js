// This script ensures environment variables are properly set for Netlify builds
const fs = require('fs');
const path = require('path');

console.log('Setting up environment variables for Netlify build...');

// Create a simple environment.js file that will be included in the build
// This file will contain the environment variables needed for the app to run
const setupEnvironmentFile = () => {
  const envFilePath = path.join(__dirname, '..', 'web', 'environment.js');
  
  // Get environment variables from process.env
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const paymongoSecretKey = process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || '';
  
  // Create content for the environment.js file
  const content = `
// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${convexUrl}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${clerkPublishableKey}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${paymongoSecretKey}";
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
  
  // Log environment variable status (without revealing values)
  console.log('Environment variables status:');
  console.log(`- EXPO_PUBLIC_CONVEX_URL: ${convexUrl ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${paymongoSecretKey ? 'Set' : 'Not set'}`);
};

// Run the setup
setupEnvironmentFile();
console.log('Environment setup completed.');
