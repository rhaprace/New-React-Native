// This script tests loading environment variables from .env.local
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing environment variable loading...');

// Path to .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  console.log(`✅ .env.local file found at: ${envLocalPath}`);
  
  // Read the file content directly
  const fileContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('\n📄 Raw .env.local file content:');
  console.log('----------------------------------------');
  
  // Print each line with sensitive data partially masked
  fileContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        
        // Mask sensitive values but show first and last few characters
        let maskedValue;
        if (value.length > 10) {
          maskedValue = `${value.substring(0, 10)}...${value.substring(value.length - 5)}`;
        } else {
          maskedValue = value;
        }
        
        console.log(`${key}=${maskedValue}`);
      } else {
        console.log(line);
      }
    } else {
      console.log(line);
    }
  });
  
  console.log('----------------------------------------\n');
  
  // Test loading the Clerk key specifically
  let clerkKey = '';
  const clerkKeyMatch = fileContent.match(/EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=([^\n]*)/);
  if (clerkKeyMatch && clerkKeyMatch[1]) {
    clerkKey = clerkKeyMatch[1].trim();
    console.log(`✅ Found Clerk key in .env.local: ${clerkKey.substring(0, 10)}...${clerkKey.substring(clerkKey.length - 5)}`);
    
    // Check if it starts with pk_
    if (clerkKey.startsWith('pk_')) {
      console.log('✅ Clerk key format is valid (starts with pk_)');
    } else {
      console.log('⚠️ Clerk key does not start with pk_');
    }
  } else {
    console.log('❌ Could not find Clerk key in .env.local');
  }
  
  // Now test the environment.js generation
  console.log('\n🔄 Testing environment.js generation...');
  
  // Create a temporary environment.js file
  const tempEnvPath = path.join(__dirname, 'temp-environment.js');
  
  // Set the Clerk key in process.env
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = clerkKey;
  
  // Generate content similar to setup-env-for-netlify.js
  const content = `
// This is a test file
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "${clerkKey}";
  `;
  
  // Write the file with double quotes
  fs.writeFileSync(tempEnvPath, content);
  console.log(`✅ Created test file with double quotes at: ${tempEnvPath}`);
  
  // Read it back
  const contentWithQuotes = fs.readFileSync(tempEnvPath, 'utf8');
  console.log('\n📄 Content with double quotes:');
  console.log(contentWithQuotes);
  
  // Now try with JSON.stringify
  const contentWithJSON = `
// This is a test file
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = ${JSON.stringify(clerkKey)};
  `;
  
  // Write the file with JSON.stringify
  fs.writeFileSync(tempEnvPath, contentWithJSON);
  console.log(`✅ Created test file with JSON.stringify at: ${tempEnvPath}`);
  
  // Read it back
  const contentWithJSONResult = fs.readFileSync(tempEnvPath, 'utf8');
  console.log('\n📄 Content with JSON.stringify:');
  console.log(contentWithJSONResult);
  
  // Clean up
  fs.unlinkSync(tempEnvPath);
  console.log(`✅ Cleaned up test file`);
  
} else {
  console.log(`❌ .env.local file not found at: ${envLocalPath}`);
}

console.log('\n✅ Environment variable testing completed');
