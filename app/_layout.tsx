import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "@/constants/theme";
import InitialLayout from "@/components/InitialLayout";
import { View } from "react-native";
import { useCallback, useEffect } from "react";
import useSplashScreenFix from "@/hooks/useSplashScreenFix";

export default function RootLayout() {
  const { onAppError } = useSplashScreenFix();

  // Add global error handler
  useEffect(() => {
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    // Set a custom error handler that will hide the splash screen on fatal errors
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <InitialLayout />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  flex: 1,
                  backgroundColor: COLORS.background,
                },
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="(auth)/login"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="(auth)/verify-email"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="subscription/plans"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="subscription/checkout"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="payment/success"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="payment/failed"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="workout/[day]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClerkAndConvexProvider>
  );
}
