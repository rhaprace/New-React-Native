import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BASE } from "@/constants/theme";
import InitialLayout from "@/components/InitialLayout";
import { View, StyleSheet } from "react-native";
import { useCallback, useEffect } from "react";
import useSplashScreenFix from "@/hooks/useSplashScreenFix";

export default function RootLayout() {
  const { onAppError } = useSplashScreenFix();

  // Add global error handler
  useEffect(() => {
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (isFatal) {
        console.error("Fatal error occurred:", error);
        onAppError();
      }
      originalErrorHandler(error, isFatal);
    });

    return () => {
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    };
  }, []);

  return (
    <ClerkAndConvexProvider>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: BASE.white },
              }}
            />
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    </ClerkAndConvexProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE.white,
  },
});
