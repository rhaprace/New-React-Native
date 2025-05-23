require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Create environment.js in the web directory
const webEnvContent = `
// This file is generated during the build process
// It contains environment variables needed for the app to run
window.EXPO_PUBLIC_CONVEX_URL = "${process.env.EXPO_PUBLIC_CONVEX_URL}";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}";
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = "${process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY}";
`;

// Ensure web directory exists
const webDir = path.join(__dirname, '..', 'web');
if (!fs.existsSync(webDir)) {
  fs.mkdirSync(webDir, { recursive: true });
}

// Write the environment.js file
fs.writeFileSync(path.join(webDir, 'environment.js'), webEnvContent);
console.log('Created environment.js in web directory');
