import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

  // If user has an active subscription, show the content
  if (userSubscription && userSubscription.subscription === "active") {
    return <>{children}</>;
  }

  // If user has a free trial, show the content but also check for expiration
  if (userSubscription && userSubscription.subscription === "free_trial") {
    return (
      <>
        <TrialExpirationChecker />
        {children}
      </>
    );
  }

  // Otherwise, show the subscription gate
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Restricted</Text>
      <Text style={styles.message}>
        You need an active subscription to access this feature.
      </Text>
      <Button
        variant="primary"
        size="lg"
        onPress={() => router.push("../subscription/plans")}
      >
        Subscribe Now
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
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
    maxWidth: "80%",
  },
});
