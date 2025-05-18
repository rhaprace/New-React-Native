import { useAuth } from "@clerk/clerk-expo";
import { useSegments, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  // Get user data from Convex
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Add state for timeout
  const [authCheckTimeout, setAuthCheckTimeout] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle navigation based on auth state
  const handleNavigation = () => {
    if (isNavigating || !isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";
    const inVerifyScreen = segments[1] === "verify-email";

    console.log("Current route segments:", segments);
    console.log("Auth state:", {
      isSignedIn,
      hasUserData: !!userData,
      userId: user?.id,
      isEmailVerified: userData?.isEmailVerified,
    });

    // If not signed in and not in auth screen, go to login
    if (!isSignedIn && !inAuthScreen) {
      console.log("User not signed in, redirecting to login");
      setIsNavigating(true);
      router.replace("/(auth)/login");
      return;
    }

    // If signed in and we have user data
    if (isSignedIn && userData) {
      // If email is not verified and not on verify screen
      if (!userData.isEmailVerified && !inVerifyScreen) {
        console.log("Email not verified, redirecting to verify-email");
        setIsNavigating(true);
        router.replace("/(auth)/verify-email");
        return;
      }

      // If in auth screen and email is verified
      if (inAuthScreen && userData.isEmailVerified) {
        console.log(
          "User authenticated and email verified, redirecting to tabs"
        );
        setIsNavigating(true);
        router.replace("/(tabs)");
        return;
      }
    } else if (isSignedIn && !userData) {
      // If signed in but no user data yet, check if we're in login screen
      console.log("User signed in but userData not loaded yet");

      // If we're in login screen and signed in, we should navigate to verify-email
      // This handles the case right after login
      if (inAuthScreen && segments[1] === "login" && !hasNavigatedRef.current) {
        console.log("Just logged in, navigating to verify-email");
        hasNavigatedRef.current = true;
        setIsNavigating(true);
        router.replace("/(auth)/verify-email");
        return;
      }
    }
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    // Set a timeout to force navigation after 5 seconds
    if (isLoaded) {
      const timeout = setTimeout(() => {
        console.log("Auth check timed out");

        // If not signed in, go to login
        if (!isSignedIn) {
          console.log("User not signed in after timeout, redirecting to login");
          setIsNavigating(true);
          router.replace("/(auth)/login");
        } else if (isSignedIn && !userData) {
          // If signed in but no user data, try to navigate to verify-email
          console.log(
            "User signed in but no userData after timeout, trying verify-email"
          );
          setIsNavigating(true);
          router.replace("/(auth)/verify-email");
        }
      }, 3000); // 3 seconds timeout

      setAuthCheckTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }

    // Clear timeout if we have user data or auth state is determined
    if (authCheckTimeout && (userData || (isLoaded && !isSignedIn))) {
      clearTimeout(authCheckTimeout);
      setAuthCheckTimeout(null);
    }
  }, [isLoaded, isSignedIn, userData]);

  // Main navigation effect
  useEffect(() => {
    handleNavigation();

    // Reset navigation state after routing is complete
    return () => {
      setIsNavigating(false);
    };
  }, [isLoaded, isSignedIn, segments, userData, user]);

  // Effect to handle immediate post-login navigation
  useEffect(() => {
    // If user just signed in and we're on login page, navigate to verify-email
    if (isSignedIn && segments[0] === "(auth)" && segments[1] === "login") {
      console.log("Detected login completion, navigating to verify-email");
      const timer = setTimeout(() => {
        router.replace("/(auth)/verify-email");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, segments]);

  // Don't render anything - this component only handles navigation
  return null;
}
