import { useAuth } from "@clerk/clerk-expo";
import { useSegments, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { View } from "react-native";
import useSplashScreenFix from "@/hooks/useSplashScreenFix";
import PermissionHandler from "@/components/PermissionHandler";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const { onLayoutRootView, onAppError } = useSplashScreenFix();

  // Flag to track if initialization is complete
  const [isInitComplete, setIsInitComplete] = useState(false);

  // Flag to track if permissions have been resolved
  const [permissionsResolved, setPermissionsResolved] = useState(false);

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

    try {
      // If not signed in and not in auth screen, go to login
      if (!isSignedIn && !inAuthScreen) {
        console.log("User not signed in, redirecting to login");
        setIsNavigating(true);
        router.replace("/(auth)/login");
        return;
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }

    try {
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
        if (
          inAuthScreen &&
          segments[1] === "login" &&
          !hasNavigatedRef.current
        ) {
          console.log("Just logged in, navigating to verify-email");
          hasNavigatedRef.current = true;
          setIsNavigating(true);
          router.replace("/(auth)/verify-email");
          return;
        }
      }
    } catch (error) {
      console.error("Navigation error in auth flow:", error);
    }
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    // Set a timeout to force navigation after 5 seconds
    if (isLoaded) {
      const timeout = setTimeout(() => {
        console.log("Auth check timed out");

        try {
          // If not signed in, go to login
          if (!isSignedIn) {
            console.log(
              "User not signed in after timeout, redirecting to login"
            );
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
        } catch (error) {
          console.error("Navigation error in timeout handler:", error);
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
        try {
          router.replace("/(auth)/verify-email");
        } catch (error) {
          console.error("Post-login navigation error:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, segments]);

  // Effect to handle sign-out state
  useEffect(() => {
    // If we were previously signed in and now we're not, and we're not already on the login page
    // This helps ensure we properly handle sign-out state changes
    const inAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthScreen) {
      console.log(
        "Detected sign-out state change, ensuring navigation to login"
      );
      router.replace("/(auth)/login");
    }
  }, [isSignedIn, segments]);

  // Effect to handle app initialization completion
  useEffect(() => {
    // Consider initialization complete when:
    // 1. Auth is loaded (even if not signed in)
    // 2. If signed in, we either have user data or timed out waiting for it
    const initComplete =
      isLoaded &&
      (!isSignedIn ||
        (isSignedIn && (userData !== undefined || authCheckTimeout === null)));

    if (initComplete && !isInitComplete) {
      console.log("App initialization complete, hiding splash screen");
      setIsInitComplete(true);

      // We don't hide the splash screen yet - we'll wait for permissions to be resolved
      // This prevents the app from showing and then immediately showing permission UI
      if (permissionsResolved) {
        // Layout check will trigger splash screen hiding
        onLayoutRootView().catch((err) => {
          console.warn("Error in layout check:", err);
          onAppError();
        });
      }
    }
  }, [
    isLoaded,
    isSignedIn,
    userData,
    authCheckTimeout,
    isInitComplete,
    permissionsResolved,
  ]);

  // Handle permissions resolved
  const handlePermissionsResolved = () => {
    console.log("Permissions resolved, continuing app initialization");
    setPermissionsResolved(true);

    // If initialization is already complete, hide splash screen now
    if (isInitComplete) {
      onLayoutRootView().catch((err) => {
        console.warn("Error in layout check after permissions:", err);
        onAppError();
      });
    }
  };

  // Return a view that can trigger the onLayout callback
  return (
    <>
      {isInitComplete && !permissionsResolved && (
        <PermissionHandler onPermissionsResolved={handlePermissionsResolved} />
      )}
      <View
        style={{ position: "absolute", width: 0, height: 0 }}
        onLayout={() => {
          if (isInitComplete && permissionsResolved) {
            onLayoutRootView().catch(onAppError);
          }
        }}
      />
    </>
  );
}
