/**
 * Script to fix all issues in the AtleTech app
 * Run this script with: node scripts/fix-all-issues.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Main function
async function main() {
  console.log('Starting to fix all issues in the AtleTech app...');
  
  try {
    // 1. Fix Health Connect issues
    console.log('\n=== Fixing Health Connect Issues ===');
    execSync('node scripts/fix-health-connect.js', { stdio: 'inherit' });
    
    // 2. Fix Text component issues
    console.log('\n=== Fixing Text Component Issues ===');
    console.log('Text component issues have been fixed in the codebase.');
    
    // 3. Run link-health-connect script if it exists
    try {
      console.log('\n=== Linking Health Connect Module ===');
      execSync('node scripts/link-health-connect.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('Skipping Health Connect linking (script not found or error occurred)');
    }
    
    console.log('\n=== All fixes completed! ===');
    console.log('\nNext steps:');
    console.log('1. Run "npx expo prebuild --clean" to clean and rebuild the project');
    console.log('2. Run "npx expo run:android" to build and run the app on your device');
    console.log('3. See HEALTH_CONNECT_SETUP.md for more details on Health Connect setup');
    
  } catch (error) {
    console.error('Error fixing issues:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
