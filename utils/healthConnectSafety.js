/**
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
        console.warn(`Health Connect ${methodName} called but native module is not available`);
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
};
