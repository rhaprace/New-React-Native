// SplashScreenFix.tsx
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function useSplashScreenFix() {
  useEffect(() => {
    // This effect will hide the splash screen after a timeout
    // even if other operations fail
    console.log("Forcing splash screen hide after timeout");
    const timer = setTimeout(() => {
      console.log("Splash screen timeout reached, forcing hide");
      SplashScreen.hideAsync().catch((err) => {
        console.log("Error hiding splash screen:", err);
      });
    }, 5000); // 5 second maximum display time

    return () => clearTimeout(timer);
  }, []);

  const onAppReady = async () => {
    try {
      // Hide the splash screen
      await SplashScreen.hideAsync();
    } catch (e) {
      // Ignore errors
      console.warn("Error hiding splash screen:", e);
    }
  };

  const onAppError = () => {
    // Hide splash screen on error too
    SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  };

  // Check if we need to add a delay for Android to ensure animation completes
  const onLayoutRootView = async () => {
    if (Platform.OS === "android") {
      // Small delay to ensure animations complete
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    onAppReady();
  };

  return {
    onLayoutRootView,
    onAppReady,
    onAppError,
  };
}
