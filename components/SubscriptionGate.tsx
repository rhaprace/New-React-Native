import React, { useEffect, useState } from "react";
import { useSegments, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Text } from "@/components/ui";
import { RestrictedAccessUI } from "./subscription/RestrictedAccessUI";

// Routes that don't require subscription
const UNRESTRICTED_ROUTES = [
  "(auth)",
  "subscription",
  "payment",
  "payment-callback",
  "profile",
];

export default function SubscriptionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSegments();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [checkTimeout, setCheckTimeout] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user subscription status
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // If user is not signed in, don't show loading
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    // If we have user data, don't show loading
    if (userData) {
      setIsLoading(false);
      return;
    }

    // Set a timeout to stop loading after 5 seconds
    const timeout = setTimeout(() => {
      console.log("Subscription check timed out");
      setIsLoading(false);
    }, 5000);

    setCheckTimeout(timeout);

    // Clean up timeout on unmount
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isSignedIn, userData]);

  // Check if route is unrestricted
  const isUnrestrictedRoute = (path: string) => {
    return UNRESTRICTED_ROUTES.some((route) => path.startsWith(route));
  };

  // Check if user has access
  const hasAccess =
    userData?.subscription === "active" ||
    userData?.subscription === "free_trial";

  // If not signed in, don't check subscription
  if (!isSignedIn) {
    // Check if route is unrestricted
    const currentPath = segments.join("/");
    if (!isUnrestrictedRoute(currentPath)) {
      console.log(
        "User not signed in, redirecting to login from SubscriptionGate"
      );
      // Use setTimeout to avoid immediate navigation which can cause issues
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);

      // Show loading while redirecting
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
          <Text variant="body2" color="secondary" style={{ marginTop: 10 }}>
            Redirecting to login...
          </Text>
        </View>
      );
    }
  }

  // Show loading state while checking subscription (with timeout)
  if (isLoading && isSignedIn) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text variant="body2" color="secondary" style={{ marginTop: 10 }}>
          Checking subscription status...
        </Text>
      </View>
    );
  }

  // If no access and not on unrestricted route, show restricted access UI
  const currentPath = segments.join("/");
  if (isSignedIn && !hasAccess && !isUnrestrictedRoute(currentPath)) {
    return <RestrictedAccessUI />;
  }

  return children;
}
