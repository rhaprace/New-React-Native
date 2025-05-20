import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import React, { useEffect } from "react";
import { View, LogBox } from "react-native";
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
      <Text style={{ marginBottom: 10 }}>Stack: {error.stack}</Text>
    </View>
  );
}

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context("./app");

  // Add more error logging
  console.log("App component rendering");

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
