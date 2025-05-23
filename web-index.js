import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import React, { useEffect } from "react";
import { View, LogBox, Platform } from "react-native";
import { ErrorBoundary } from "react-error-boundary";
import { Text } from "@/components/ui";

// Ignore all logs for now to focus on fixing critical issues
LogBox.ignoreAllLogs();

// Error fallback component
function ErrorFallback({ error }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Something went wrong:
      </Text>
      <Text style={{ color: "red", marginBottom: 20 }}>{error.message}</Text>
      <Text style={{ marginBottom: 10 }}>
        {error.stack ? error.stack.toString().substring(0, 500) : "No stack trace available"}
      </Text>
    </View>
  );
}

// Web-specific initialization
function initializeWeb() {
  // Add any web-specific initialization here
  console.log("Initializing web platform");
  
  // Add a global error handler for uncaught exceptions
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });
  
  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context("./app");

  // Initialize web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      initializeWeb();
    }
  }, []);

  // Add more error logging
  console.log("App component rendering on platform:", Platform.OS);

  try {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          console.error("Error caught by ErrorBoundary:", error);
        }}
      >
        <ExpoRoot context={ctx} />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Failed to initialize app</Text>
      </View>
    );
  }
}

registerRootComponent(App);
