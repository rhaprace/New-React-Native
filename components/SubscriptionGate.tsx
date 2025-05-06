import React from "react";
import Gate from "@/app/subscription/gate";
import { useSegments } from "expo-router";

export default function SubscriptionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSegments();

  try {
    // Check if we're in a tab screen that should be gated
    const shouldGate =
      segments[0] === "(tabs)" &&
      // Allow profile tab to be accessible without restrictions
      segments[1] !== "profile";

    // Apply gate only to tab screens (except profile)
    if (shouldGate) {
      return <Gate>{children}</Gate>;
    }
  } catch (error) {
    console.error("Error in SubscriptionGate:", error);
    // In case of error, don't gate to avoid blocking the app
  }

  // Don't gate other screens or if there was an error
  return <>{children}</>;
}
