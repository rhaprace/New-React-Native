import React from 'react';
import { Platform, View, Text } from 'react-native';

/**
 * Utility to render platform-specific components
 * @param props Component props with platform-specific implementations
 * @returns The appropriate component for the current platform
 */
export function PlatformSpecific({
  web,
  native,
  ios,
  android,
  fallback,
}: {
  web?: React.ReactNode;
  native?: React.ReactNode;
  ios?: React.ReactNode;
  android?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (Platform.OS === 'web' && web) {
    return <>{web}</>;
  }
  
  if (Platform.OS === 'ios' && ios) {
    return <>{ios}</>;
  }
  
  if (Platform.OS === 'android' && android) {
    return <>{android}</>;
  }
  
  if (Platform.OS !== 'web' && native) {
    return <>{native}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return null;
}

/**
 * Utility to render a component only on web
 * @param props Component props
 * @returns The component if on web, null otherwise
 */
export function WebOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Utility to render a component only on native platforms
 * @param props Component props
 * @returns The component if on native, null otherwise
 */
export function NativeOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Utility to render a web fallback for native-only components
 * @param props Component props
 * @returns The appropriate component or fallback
 */
export function WebFallback({
  component,
  fallback,
}: {
  component: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <PlatformSpecific
      native={component}
      web={fallback}
    />
  );
}

/**
 * Default web fallback for unsupported native features
 */
export function DefaultWebFallback({ 
  message = "This feature is not available on web" 
}: { 
  message?: string 
}) {
  return (
    <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ textAlign: 'center', color: '#666' }}>
        {message}
      </Text>
    </View>
  );
}

/**
 * Check if the current platform is web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Check if the current platform is native (iOS or Android)
 */
export const isNative = Platform.OS !== 'web';

/**
 * Check if the current platform is iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if the current platform is Android
 */
export const isAndroid = Platform.OS === 'android';
