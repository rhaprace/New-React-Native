import { Redirect } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  // Make sure splash screen is hidden when redirecting
  useEffect(() => {
    // Force splash screen to hide when this component is mounted
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch((e) => {
        console.warn("Error hiding splash screen:", e);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return <Redirect href="/(auth)/login" />;
}
