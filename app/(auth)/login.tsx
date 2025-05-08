import { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";

export default function Login() {
  const { startSSOFlow } = useSSO();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.users.createUser);
  const checkSubscriptionStatus = useMutation(
    api.subscription.checkSubscriptionStatus
  );

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    const handleUserAuth = async () => {
      if (!isLoaded || !user) return;

      try {
        // This will either create a new user or return an existing user
        const newOrExistingUser = await createUser({
          username: user.username || "Unknown",
          fullname: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.primaryEmailAddress?.emailAddress || "Unknown",
          image: user.imageUrl || undefined,
          clerkId: user.id,
        });

        // If user creation failed (shouldn't happen based on the code)
        if (!newOrExistingUser) {
          router.replace("/subscription/plans");
          return;
        }

        // Check if this is a new user (hasSeenSubscriptionPrompt will be false for new users)
        const isNewUser = newOrExistingUser.hasSeenSubscriptionPrompt === false;

        // Check subscription status for existing users
        const { status } = await checkSubscriptionStatus();

        // Logic for handling different user states
        if (isNewUser) {
          // New user - show subscription screen
          console.log("New user - redirecting to subscription screen");
          router.replace("/subscription/plans");
        } else if (status === "active" || status === "free_trial") {
          // Existing user with active subscription - go to profile
          console.log(
            "Existing user with active subscription - redirecting to profile"
          );
          router.replace("/(tabs)");
        } else if (
          newOrExistingUser.subscription === "inactive" ||
          newOrExistingUser.subscription === "expired"
        ) {
          // Existing user with inactive/expired subscription - show subscription screen
          console.log(
            "Existing user with inactive/expired subscription - redirecting to subscription screen"
          );
          router.replace("/subscription/plans");
        } else {
          // Fallback - show subscription screen
          console.log(
            "User with unknown status - redirecting to subscription screen"
          );
          router.replace("/subscription/plans");
        }
      } catch (error) {
        console.error("Error handling user auth:", error);
      }
    };

    handleUserAuth();
  }, [user, isLoaded]);

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="dumbbell" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>atletech</Text>
        <Text style={styles.tagline}>don't miss anything</Text>
      </View>
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/loginImage.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
        >
          <View style={styles.googleContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
