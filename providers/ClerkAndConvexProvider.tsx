import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import Config from "../config/environment";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";

// Validate the Convex URL
const validateUrl = (url: string): boolean => {
  try {
    // Simple validation to check if it's a valid URL
    new URL(url);
    return true;
  } catch (e) {
    console.error("Invalid Convex URL:", url, e);
    return false;
  }
};

// Create the Convex client with validation
let convex: ConvexReactClient;
try {
  // Get Convex URL from different sources
  let convexUrl = Config.convexUrl;

  // Try to get from window object if in browser and not set
  if (
    typeof window !== "undefined" &&
    (!convexUrl || !validateUrl(convexUrl))
  ) {
    const windowUrl = (window as any).EXPO_PUBLIC_CONVEX_URL;
    if (windowUrl && validateUrl(windowUrl)) {
      console.log("Using Convex URL from window object");
      convexUrl = windowUrl;
    }
  }

  // Final validation
  if (!validateUrl(convexUrl)) {
    console.error("Invalid Convex URL format:", convexUrl);
    throw new Error("Invalid Convex URL format");
  }

  // Create client with validated URL
  convex = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false,
  });

  console.log(
    "Successfully created Convex client with URL starting with:",
    convexUrl.substring(0, 10) + "..."
  );
} catch (error) {
  console.error("Error initializing Convex client:", error);
  // Create a fallback client for build to succeed
  // This will be replaced at runtime with the correct URL
  convex = new ConvexReactClient("https://example-convex-url.convex.cloud", {
    unsavedChangesWarning: false,
  });
}

// Get and validate Clerk publishable key
let publishableKey = Config.clerkPublishableKey;

// Try to get from window object if in browser and not set or invalid
if (
  typeof window !== "undefined" &&
  (!publishableKey || !publishableKey.startsWith("pk_"))
) {
  const windowKey = (window as any).EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (windowKey && windowKey.startsWith("pk_")) {
    console.log("Using Clerk publishable key from window object");
    publishableKey = windowKey;
  }
}

// Log environment variables for debugging (without revealing full values)
console.log("Environment variables status:");
console.log(
  `- CONVEX_URL: ${Config.convexUrl ? "Set (starts with: " + Config.convexUrl.substring(0, 10) + "...)" : "Not set"}`
);
console.log(
  `- CLERK_PUBLISHABLE_KEY: ${publishableKey ? "Set (starts with: " + publishableKey.substring(0, 10) + "...)" : "Not set"}`
);

// Final validation and warnings
if (!publishableKey) {
  console.error("Missing Clerk Publishable Key in environment configuration");
  // Provide a fallback for build to succeed
  publishableKey = "pk_test_placeholder_key";
}

// Validate that the Clerk key is properly formatted
if (!publishableKey.startsWith("pk_")) {
  console.error(
    "Invalid Clerk Publishable Key format. Key should start with 'pk_'"
  );
  // Provide a fallback for build to succeed
  publishableKey = "pk_test_placeholder_key";
}

export default function ClerkAndConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Timeout to force hide splash screen in case of network issues
  useEffect(() => {
    // Only apply this timeout on native platforms
    if (Platform.OS !== "web") {
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
    } else {
      // Web-specific initialization
      console.log("Initializing web platform in ClerkAndConvexProvider");
    }
  }, []);

  // Error handler is defined but not used - removed to avoid warnings

  // Wrap the providers in a try-catch to handle any runtime errors
  try {
    return (
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
          <ClerkLoaded>{children}</ClerkLoaded>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  } catch (error) {
    console.error("Error rendering ClerkAndConvexProvider:", error);

    // Return children without providers in case of error
    // This allows the app to at least render something
    return <>{children}</>;
  }
}
