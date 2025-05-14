import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import GCashLinkModal from "@/components/subscription/GCashLinkModal";
import PaymentChecker from "./payment-checker";
import { useAuth, useUser } from "@clerk/clerk-expo";
import MockPaymentModal from "@/components/subscription/MockPaymentModal";

export default function SubscriptionPlans() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMockPaymentModal, setShowMockPaymentModal] = useState<
    null | "card" | "gcash"
  >(null);
  const [mockPaymentDetails, setMockPaymentDetails] = useState<{
    type: string;
    value: string;
  } | null>(null);

  const startTrial = useMutation(api.subscription.startFreeTrial);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  const checkSubscription = useMutation(
    api.subscription.checkSubscriptionStatus
  );
  // Fetch user data to check hasSeenSubscriptionPrompt and subscription status
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Only show the subscription prompt for first-time users with inactive/expired subscription
  const shouldShowSubscriptionPrompt =
    userData &&
    !userData.hasSeenSubscriptionPrompt &&
    (userData.subscription === "inactive" ||
      userData.subscription === "expired");

  // Handle selecting a plan
  const handleSelectPlan = async (
    plan: string,
    price: number,
    isDiscounted: boolean = false,
    originalPrice?: number
  ) => {
    try {
      setLoading(true);
      const currentStatus = await checkSubscription();

      // Check if user has an active subscription
      if (currentStatus.status === "active") {
        // Show plan change confirmation
        Alert.alert(
          "Change Plan",
          "You already have an active subscription. Would you like to change your plan?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Change Plan",
              onPress: async () => {
                try {
                  // Calculate prorated amount
                  const now = new Date();
                  const endDate = new Date(currentStatus.endDate || "");
                  const daysRemaining = Math.ceil(
                    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const totalDays = 30; // Assuming 30 days billing cycle
                  const currentPlanRemaining = Math.round(
                    price * (daysRemaining / totalDays)
                  );

                  // Calculate new plan cost
                  const newPlanCost = isDiscounted
                    ? price
                    : originalPrice || price;
                  const proratedNewPlanCost = Math.round(
                    newPlanCost * (daysRemaining / totalDays)
                  );

                  // Calculate final amount to charge
                  const finalAmount = Math.max(
                    0,
                    proratedNewPlanCost - currentPlanRemaining
                  );

                  // Navigate to checkout with plan change details
                  router.push({
                    pathname: "/subscription/checkout",
                    params: {
                      planName: plan,
                      planPrice: finalAmount.toString(),
                      planDescription: `Plan change to ${plan}`,
                      isDiscounted: isDiscounted ? "true" : "false",
                      originalPrice: originalPrice
                        ? originalPrice.toString()
                        : "",
                      isPlanChange: "true",
                      currentPlanRemaining: currentPlanRemaining.toString(),
                    },
                  });
                } catch (error) {
                  console.error("Error calculating plan change:", error);
                  Alert.alert(
                    "Error",
                    "Failed to process plan change. Please try again."
                  );
                }
              },
            },
          ]
        );
      } else {
        // Regular new subscription flow
        router.push({
          pathname: "/subscription/checkout",
          params: {
            planName: plan,
            planPrice: price.toString(),
            planDescription: `${plan} subscription with full access`,
            isDiscounted: isDiscounted ? "true" : "false",
            originalPrice: originalPrice ? originalPrice.toString() : "",
          },
        });
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      Alert.alert("Error", "Failed to process subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle free trial
  const handleFreeTrial = async () => {
    if (!isSignedIn) {
      router.push("/(auth)/login");
      return;
    }
    setShowMockPaymentModal("card");
  };

  // Handle free trial with GCash
  const handleFreeTrialWithGCash = () => {
    if (!isSignedIn) {
      router.push("/(auth)/login");
      return;
    }
    setShowMockPaymentModal("gcash");
  };

  // After mock payment is saved, proceed with trial logic
  const handleMockPaymentSuccess = async (details: {
    type: string;
    value: string;
  }) => {
    setShowMockPaymentModal(null);
    setMockPaymentDetails(details);
    setLoading(true);
    try {
      // Only allow 'card', 'gcash', or 'paymaya' as paymentMethod
      const paymentMethod =
        details.type === "card" ||
        details.type === "gcash" ||
        details.type === "paymaya"
          ? details.type
          : "card";
      const response = await startTrial({ paymentMethod });
      await updatePromptSeen();
      if (response.success) {
        Alert.alert(
          "Trial Successfully Activated!",
          `Your 30-day free trial has been activated with ${paymentMethod === "gcash" ? "GCash" : paymentMethod === "paymaya" ? "PayMaya" : "Card"} linking. You now have full access to all features.`,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/profile");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to start free trial. Please try again.");
      }
    } catch (error) {
      console.error("Error starting free trial:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("already used your free trial")) {
        Alert.alert(
          "Trial Already Used",
          "You've already used your free trial. Please choose a subscription plan."
        );
      } else {
        Alert.alert("Error", "There was an error starting your free trial.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Choose Your Plan</Text>
            <View style={styles.placeholder} />
          </View>

          <PaymentChecker />

          <Text style={styles.subtitle}>
            Start your fitness journey with AthleTech!
          </Text>

          {/* Monthly Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Monthly Plan</Text>
              {(!isSignedIn || (userData && !userData.trialUsed)) && (
                <View style={styles.trialBadge}>
                  <Text style={styles.trialText}>Free Trial Available</Text>
                </View>
              )}
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>₱75.00</Text>
              <Text style={styles.billingCycle}>for first 3 months</Text>
              <Text style={styles.regularPrice}>₱200.00 after promotion</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  Access to all workout plans
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  Personalized nutrition guidance
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  Progress tracking and analytics
                </Text>
              </View>
            </View>

            {!isSignedIn || (userData && !userData.trialUsed) ? (
              <View style={styles.trialButtons}>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={handleFreeTrial}
                  loading={loading}
                  style={styles.trialButton}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={handleFreeTrialWithGCash}
                  style={styles.trialButton}
                >
                  Link GCash & Start Trial
                </Button>
              </View>
            ) : (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={() => handleSelectPlan("Monthly", 7500, true, 20000)}
                loading={loading}
              >
                Subscribe Now
              </Button>
            )}
          </View>

          {/* Yearly Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Yearly Plan</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 50%</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>₱1,200.00</Text>
              <Text style={styles.billingCycle}>per year</Text>
              <Text style={styles.regularPrice}>₱2,400.00 regular price</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  All Monthly Plan features
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  Priority customer support
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.featureText}>
                  Exclusive premium content
                </Text>
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={() => handleSelectPlan("Yearly", 120000, true, 240000)}
              loading={loading}
            >
              Subscribe Now
            </Button>
          </View>
        </View>
      </ScrollView>

      <MockPaymentModal
        visible={!!showMockPaymentModal}
        paymentType={showMockPaymentModal || "card"}
        onClose={() => setShowMockPaymentModal(null)}
        onSuccess={handleMockPaymentSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: FONT.size.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  planTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  trialBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  trialText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  savingsText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  priceContainer: {
    marginBottom: SPACING.lg,
  },
  price: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  billingCycle: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  regularPrice: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
    marginTop: SPACING.xs,
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  trialButtons: {
    gap: SPACING.sm,
  },
  trialButton: {
    marginBottom: SPACING.sm,
  },
});
