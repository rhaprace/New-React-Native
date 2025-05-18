import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import Button from "@/components/ui/Button";
import { COLORS, FONT, SPACING } from "@/constants/theme";
import TrialExpirationChecker from "@/components/subscription/TrialExpirationChecker";

export default function Gate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useUser();
  const userSubscription = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  if (user?.id && !userSubscription) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Checking subscription status...
          </Text>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </View>
    );
  }
  useEffect(() => {
    const handleBackPress = () => {
      router.push("/subscription/plans");
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => subscription.remove();
  }, [userSubscription, router]);
  const hasAccess =
    userSubscription?.subscription === "active" ||
    userSubscription?.subscription === "free_trial";
  const showAccessModal = !hasAccess;

  if (showAccessModal) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.message}>
          You need an active subscription to access this feature.
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push("/subscription/plans")}
        >
          Subscribe Now
        </Button>
      </View>
    );
  }
  if (hasAccess) {
    if (userSubscription.subscription === "free_trial") {
      return (
        <>
          <TrialExpirationChecker />
          {children}
        </>
      );
    }
    return <>{children}</>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
});
