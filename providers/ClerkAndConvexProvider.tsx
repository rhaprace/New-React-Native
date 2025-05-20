import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import Config from "../config/environment";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Use the environment-specific configuration
const convex = new ConvexReactClient(Config.convexUrl, {
  unsavedChangesWarning: false,
});
const publishableKey = Config.clerkPublishableKey;
if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key in environment configuration");
}

export default function ClerkAndConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Timeout to force hide splash screen in case of network issues
  useEffect(() => {
    const forceHideSplashTimeout = setTimeout(() => {
      console.log("Forcing splash screen hide after timeout");
      SplashScreen.hideAsync().catch((e) => {
        console.warn("Error force hiding splash screen:", e);
      });

      // Force navigation to login screen if we're timing out
      try {
        const { router } = require("expo-router");
        if (router && typeof router.replace === "function") {
          router.replace("/(auth)/login");
          console.log("Forced navigation to login screen after timeout");
        } else {
          console.error("Router or replace function not available");
        }
      } catch (navError) {
        console.error("Failed to force navigation:", navError);
      }
    }, 8000); // 8 seconds timeout

    return () => clearTimeout(forceHideSplashTimeout);
  }, []);

  // Error handler is defined but not used - removed to avoid warnings

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>{children}</ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
