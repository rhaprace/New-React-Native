// Environment configuration utility
import Constants from 'expo-constants';

// Define environment types
type Environment = 'development' | 'staging' | 'production';

// Get the current environment from Expo Constants
const getEnvironment = (): Environment => {
  // You can customize this logic based on how you determine environments
  // For EAS builds, you can use the releaseChannel
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';
  
  if (releaseChannel.indexOf('prod') !== -1) return 'production';
  if (releaseChannel.indexOf('staging') !== -1) return 'staging';
  return 'development';
};

// Get environment-specific variables
const getEnvironmentVariable = (name: string): string => {
  // Access environment variables from process.env
  // These will be set during the build process based on the EAS profile
  return (process.env as Record<string, string>)[name] || '';
};

// Server URLs for different environments
const CONVEX_URLS = {
  development: getEnvironmentVariable('EXPO_PUBLIC_CONVEX_URL'),
  staging: getEnvironmentVariable('EXPO_PUBLIC_CONVEX_URL'),
  production: getEnvironmentVariable('EXPO_PUBLIC_CONVEX_URL'),
};

// Export configuration
export const Config = {
  environment: getEnvironment(),
  convexUrl: CONVEX_URLS[getEnvironment()],
  clerkPublishableKey: getEnvironmentVariable('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  paymongoSecretKey: getEnvironmentVariable('EXPO_PUBLIC_PAYMONGO_SECRET_KEY'),
};

export default Config;
