// This script creates a .env file for the build process
const fs = require('fs');
const path = require('path');

console.log('Creating .env file for build process...');

// Create a .env file with environment variables
const createEnvFile = () => {
  const envFilePath = path.join(__dirname, '..', '.env');
  
  // Get environment variables from process.env
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const paymongoSecretKey = process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || '';
  
  // Create content for the .env file
  const content = `
# This file is generated during the build process
EXPO_PUBLIC_CONVEX_URL=${convexUrl}
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkPublishableKey}
EXPO_PUBLIC_PAYMONGO_SECRET_KEY=${paymongoSecretKey}
`;

  // Write the file
  fs.writeFileSync(envFilePath, content);
  console.log(`Created .env file at: ${envFilePath}`);
  
  // Log environment variable status (without revealing values)
  console.log('Environment variables written to .env file:');
  console.log(`- EXPO_PUBLIC_CONVEX_URL: ${convexUrl ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${paymongoSecretKey ? 'Set' : 'Not set'}`);
};

// Run the function
createEnvFile();
console.log('.env file creation completed.');
