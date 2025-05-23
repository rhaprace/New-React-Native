// This script loads environment variables from .env.local and sets them in process.env
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('Loading environment variables from .env.local...');

// Path to .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  // Load environment variables from .env.local
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  
  // Set each environment variable
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  
  console.log('Environment variables loaded from .env.local:');
  console.log(`- EXPO_PUBLIC_CONVEX_URL: ${process.env.EXPO_PUBLIC_CONVEX_URL ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: ${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}`);
  console.log(`- EXPO_PUBLIC_PAYMONGO_SECRET_KEY: ${process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY ? 'Set' : 'Not set'}`);
} else {
  console.warn('⚠️ .env.local file not found. Using environment variables from process.env.');
}

// Run the setup-env-for-netlify script to create the environment.js file
require('./setup-env-for-netlify');
