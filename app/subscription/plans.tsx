import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DiscountModal from "@/components/subscription/DiscountModal";
import PaymentChecker from "./payment-checker";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { linkGCashAccount } from "@/services/paymentService";
import { styles } from "@/styles/plans.styles";

export default function SubscriptionPlans() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isLinkingGCash, setIsLinkingGCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const startTrial = useMutation(api.subscription.startFreeTrial);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  const checkSubscription = useMutation(
    api.subscription.checkSubscriptionStatus
  );
  const saveGCashNumber = useMutation(api.subscription.saveGCashNumber);
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
                  const now = new Date();
                  const endDate = new Date(currentStatus.endDate || "");
                  const daysRemaining = Math.ceil(
                    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const totalDays = 30; // Assuming 30 days billing cycle
                  const currentPlanRemaining = Math.round(
                    price * (daysRemaining / totalDays)
                  );
                  const newPlanCost = isDiscounted
                    ? price
                    : originalPrice || price;
                  const proratedNewPlanCost = Math.round(
                    newPlanCost * (daysRemaining / totalDays)
                  );
                  const finalAmount = Math.max(
                    0,
                    proratedNewPlanCost - currentPlanRemaining
                  );
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
  const handleFreeTrial = async () => {
    if (!isSignedIn) {
      router.push("/(auth)/login");
      return;
    }
    setIsLinkingGCash(true);
  };
  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };
  const handleLinkGCash = async () => {
    // Validate phone number format
    // Philippines mobile numbers are typically: 09XXXXXXXXX (11 digits total)
    // or 9XXXXXXXXX (10 digits total)
    if (
      !phoneNumber ||
      (phoneNumber.length !== 10 && phoneNumber.length !== 11) ||
      (phoneNumber.length === 11 && !phoneNumber.startsWith("09")) ||
      (phoneNumber.length === 10 && !phoneNumber.startsWith("9"))
    ) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid Philippine mobile number (e.g., 09XXXXXXXXX or 9XXXXXXXXX)."
      );
      return;
    }

    setLoading(true);
    try {
      // Make sure we have a proper name to pass (either from user profile or a default)
      const userName =
        user?.fullName ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : "AthleTech User");

      const userEmail = user?.primaryEmailAddress?.emailAddress || "";

      // Call the updated linkGCashAccount function with proper parameters
      const { customerId, paymentMethodId } = await linkGCashAccount(
        phoneNumber,
        userName,
        userEmail
      );

      await saveGCashNumber({
        phoneNumber,
        paymongoCustomerId: customerId,
        paymongoPaymentMethodId: paymentMethodId,
      });
      await handleStartTrial();
    } catch (error) {
      setLoading(false);
      console.error("Error linking GCash account:", error);
      Alert.alert(
        "Error",
        "There was an error linking your GCash account. Please try again."
      );
    }
  };
  const handleStartTrial = async () => {
    try {
      const response = await startTrial({ paymentMethod: "gcash" });
      await updatePromptSeen();

      if (response.success) {
        setIsLinkingGCash(false);
        setPhoneNumber("");
        setLoading(false);

        Alert.alert(
          "Trial Successfully Activated!",
          "Your 30-day free trial has been activated with GCash linking. You now have full access to all features.",
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
        setLoading(false);
        Alert.alert("Error", "Failed to start free trial. Please try again.");
      }
    } catch (error) {
      console.error("Error starting free trial:", error);
      setLoading(false);

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
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Monthly Plan</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>₱200</Text>
              <Text style={styles.billingCycle}>per month</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>
                  Access to all workout programs
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>Personalized meal plans</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>Progress tracking</Text>
              </View>
            </View>

            {!isSignedIn || (userData && !userData.trialUsed) ? (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={handleFreeTrial}
                loading={loading}
                style={styles.trialButton}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={COLORS.textOnPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: COLORS.textOnPrimary }}>
                    Start Free 30-Day Trial (Link GCash)
                  </Text>
                </View>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={() => handleSelectPlan("Monthly", 20000)}
                loading={loading}
              >
                Subscribe Now
              </Button>
            )}
          </View>
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

      {/* GCash Linking Modal */}
      <Modal visible={isLinkingGCash} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link GCash Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLinkingGCash(false);
                  setPhoneNumber("");
                  setLoading(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              To activate your free 30-day trial, please link your GCash
              account. No charges will be made during the trial period.
            </Text>

            <View style={styles.securityNote}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.securityText}>
                Your payment information is securely processed
              </Text>
            </View>
            <Text style={styles.inputLabel}>GCash Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.phonePrefix}>+63</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9XXXXXXXXX (without +63)"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                maxLength={11}
              />
            </View>
            <Text style={styles.inputHint}>
              Enter the phone number associated with your GCash account (e.g.,
              09XXXXXXXXX)
            </Text>
            <View style={styles.modalButtons}>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={handleLinkGCash}
                loading={loading}
                disabled={loading}
              >
                {loading ? "Linking..." : "Link GCash & Start Trial"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <DiscountModal
        visible={false}
        onClose={() => {}}
        onSelectMonthlyPlan={() => {}}
        onSelectYearlyPlan={() => {}}
        onSelectFreeTrial={() => {}}
        daysLeft={30}
        showPromoOffer={false}
      />
    </SafeAreaView>
  );
}
