/**
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
};
