import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useSSO } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";

export default function Login() {
  const { startSSOFlow } = useSSO();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.users.createUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
        setTimeout(() => {
          console.log("Login successful, manually navigating to verify-email");
          router.replace("/(auth)/verify-email");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    const currentUser = user;
    async function initializeUser() {
      try {
        console.log("Creating/updating user in Convex:", currentUser.id);
        await createUser({
          username: currentUser.username ?? "Unknown",
          fullname:
            `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim(),
          email: currentUser.primaryEmailAddress?.emailAddress ?? "Unknown",
          image: currentUser.imageUrl,
          clerkId: currentUser.id,
        });
        console.log("User created/updated successfully");
      } catch (error) {
        console.error("Error during user initialization:", error);
      }
    }

    initializeUser();
  }, [user, isLoaded, createUser]);

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
        {isLoggingIn ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.9}
            disabled={isLoggingIn}
          >
            <View style={styles.googleContainer}>
              <Ionicons name="logo-google" size={20} color={COLORS.gray} />
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
