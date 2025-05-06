/**
 * Script to fix Health Connect integration issues
 * Run this script with: node scripts/fix-health-connect.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const UTILS_DIR = path.join(__dirname, '..', 'utils');
const HEALTH_CONNECT_SAFETY_PATH = path.join(UTILS_DIR, 'healthConnectSafety.js');
const INIT_HEALTH_CONNECT_PATH = path.join(UTILS_DIR, 'initHealthConnect.js');

// Main function
async function main() {
  console.log('Starting to fix Health Connect integration issues...');
  
  try {
    // 1. Check if Health Connect plugin is in app.json
    updateAppJson();
    
    // 2. Ensure safety wrappers exist
    ensureSafetyWrappers();
    
    // 3. Check if the package is installed
    checkAndInstallPackage();
    
    console.log('\n=== Health Connect fixes completed! ===');
    console.log('\nNext steps:');
    console.log('1. Run "npx expo prebuild --clean" to clean and rebuild the project');
    console.log('2. Run "npx expo run:android" to build and run the app on your device');
    console.log('3. If you still have issues, run "node scripts/link-health-connect.js"');
    
  } catch (error) {
    console.error('Error fixing Health Connect issues:', error);
  }
}

// Function to update app.json
function updateAppJson() {
  try {
    console.log('Checking app.json for Health Connect plugin...');
    
    if (!fs.existsSync(APP_JSON_PATH)) {
      console.error('app.json not found. Make sure you are running this script from the project root.');
      return false;
    }
    
    let appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));
    
    // Check if plugins array exists
    if (!appJson.expo.plugins) {
      appJson.expo.plugins = [];
    }
    
    // Check if Health Connect plugin is already included
    const hasHealthConnectPlugin = appJson.expo.plugins.some(plugin => {
      if (typeof plugin === 'string') {
        return plugin === 'react-native-health-connect';
      } else if (typeof plugin === 'object' && Array.isArray(plugin)) {
        return plugin[0] === 'react-native-health-connect';
      }
      return false;
    });
    
    if (!hasHealthConnectPlugin) {
      console.log('Adding Health Connect plugin to app.json...');
      appJson.expo.plugins.push('react-native-health-connect');
      fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2));
      console.log('Successfully updated app.json');
    } else {
      console.log('Health Connect plugin already exists in app.json');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating app.json:', error);
    return false;
  }
}

// Function to ensure safety wrappers exist
function ensureSafetyWrappers() {
  try {
    console.log('Checking for Health Connect safety wrappers...');
    
    // Create utils directory if it doesn't exist
    if (!fs.existsSync(UTILS_DIR)) {
      fs.mkdirSync(UTILS_DIR, { recursive: true });
    }
    
    // Create or update healthConnectSafety.js
    if (!fs.existsSync(HEALTH_CONNECT_SAFETY_PATH)) {
      console.log('Creating healthConnectSafety.js...');
      const safetyContent = `/**
 * Health Connect Safety Wrapper
 * 
 * This module provides safety measures to prevent crashes when the
 * react-native-health-connect native module is not properly linked.
 */

// Flag to track if safety measures have been applied
let safetyApplied = false;

/**
 * Apply safety measures to prevent crashes when Health Connect is not properly linked
 */
export const preventHealthConnectCrashes = () => {
  // Only apply once
  if (safetyApplied) return;
  
  try {
    console.log('Applying Health Connect safety measures...');
    
    // Helper to create a safe method that won't crash if called
    const createSafeMethod = (methodName) => {
      return (...args) => {
        console.warn(\`Health Connect \${methodName} called but native module is not available\`);
        // Return appropriate fallback values based on method
        if (methodName === 'initialize') return Promise.resolve(false);
        if (methodName === 'requestPermission') return Promise.resolve([]);
        if (methodName === 'readRecords') return Promise.resolve({ records: [] });
        if (methodName === 'getSdkStatus') return Promise.resolve(0);
        if (methodName === 'openHealthConnectSettings') return undefined;
        return Promise.resolve(null);
      };
    };
    
    // Create a safe proxy for the HealthConnectModule
    const createSafeHealthConnectModule = () => {
      return {
        initialize: createSafeMethod('initialize'),
        requestPermission: createSafeMethod('requestPermission'),
        readRecords: createSafeMethod('readRecords'),
        getSdkStatus: createSafeMethod('getSdkStatus'),
        openHealthConnectSettings: createSafeMethod('openHealthConnectSettings'),
      };
    };
    
    // Override the global HealthConnectModule with our safe version
    // This ensures that even if the native module is missing, the JS calls won't crash
    if (!global.HealthConnectModule) {
      global.HealthConnectModule = createSafeHealthConnectModule();
    }
    
    // Mark as applied
    safetyApplied = true;
    console.log('Health Connect safety measures applied successfully');
  } catch (error) {
    console.warn('Failed to apply Health Connect safety measures:', error);
  }
};

export default {
  preventHealthConnectCrashes,
};`;
      fs.writeFileSync(HEALTH_CONNECT_SAFETY_PATH, safetyContent);
    } else {
      console.log('healthConnectSafety.js already exists');
    }
    
    // Create or update initHealthConnect.js
    if (!fs.existsSync(INIT_HEALTH_CONNECT_PATH)) {
      console.log('Creating initHealthConnect.js...');
      const initContent = `/**
 * Health Connect Initialization Module
 * 
 * This module provides a safe way to initialize the Health Connect module
 * and handles errors gracefully.
 */

import { Platform } from 'react-native';
import { preventHealthConnectCrashes } from './healthConnectSafety';

// Apply safety measures to prevent crashes
preventHealthConnectCrashes();

// Safe imports for Health Connect
let healthConnect = null;
try {
  if (Platform.OS === 'android') {
    healthConnect = require('react-native-health-connect');
    console.log('Health Connect module imported successfully');
  }
} catch (error) {
  console.warn('Error importing Health Connect module:', error);
  healthConnect = null;
}

/**
 * Safely initialize Health Connect
 * @returns {Promise<boolean>} True if initialization was successful
 */
export const initializeHealthConnect = async () => {
  if (Platform.OS !== 'android') {
    console.log('Health Connect is only available on Android');
    return false;
  }
  
  if (!healthConnect) {
    console.warn('Health Connect module is not available');
    return false;
  }
  
  try {
    // Check if Health Connect is available
    const status = await healthConnect.getSdkStatus();
    const isAvailable = status !== 0;
    
    if (!isAvailable) {
      console.log('Health Connect is not available on this device');
      return false;
    }
    
    // Initialize Health Connect
    const result = await healthConnect.initialize();
    if (result) {
      console.log('Health Connect initialized successfully');
      return true;
    } else {
      console.log('Failed to initialize Health Connect');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Health Connect:', error);
    return false;
  }
};

export default {
  healthConnect,
  initializeHealthConnect,
};`;
      fs.writeFileSync(INIT_HEALTH_CONNECT_PATH, initContent);
    } else {
      console.log('initHealthConnect.js already exists');
    }
    
    console.log('Safety wrappers are in place');
    return true;
  } catch (error) {
    console.error('Error ensuring safety wrappers:', error);
    return false;
  }
}

// Function to check if the package is installed and install it if needed
function checkAndInstallPackage() {
  try {
    console.log('Checking if react-native-health-connect is installed...');
    
    // Check if the package is in node_modules
    const packagePath = path.join(__dirname, '..', 'node_modules', 'react-native-health-connect');
    const isInstalled = fs.existsSync(packagePath);
    
    if (!isInstalled) {
      console.log('react-native-health-connect is not installed. Installing...');
      execSync('npm install react-native-health-connect', { stdio: 'inherit' });
      console.log('Successfully installed react-native-health-connect');
    } else {
      console.log('react-native-health-connect is already installed');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking or installing package:', error);
    return false;
  }
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
