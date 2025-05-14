import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useUser } from "@clerk/clerk-expo";

export default function SubscriptionManage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Get current subscription status
  const checkSubscription = useMutation(
    api.subscription.checkSubscriptionStatus
  );
  const updateSubscription = useMutation(api.subscription.updateSubscription);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const currentStatus = await checkSubscription();

      // Calculate prorated refund if applicable
      const now = new Date();
      const endDate = new Date(currentStatus.endDate || "");
      const daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDays = Math.ceil(
        (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const refundAmount =
        daysRemaining > 0 ? Math.round(1000 * (daysRemaining / totalDays)) : 0; // Assuming 1000 as base amount

      // Update subscription status
      await updateSubscription({
        subscription: "inactive",
        paymentDetails: {
          status: "completed",
          amount: 0,
          currency: "PHP",
          lastPaymentDate: new Date().toISOString(),
          nextBillingDate: new Date().toISOString(),
          subscriptionEndDate: new Date().toISOString(),
        },
      });

      Alert.alert(
        "Subscription Cancelled",
        refundAmount > 0
          ? `Your subscription has been cancelled. A prorated refund of ₱${(refundAmount / 100).toFixed(2)} will be processed.`
          : "Your subscription has been cancelled.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/profile"),
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      Alert.alert("Error", "Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleChangePlan = () => {
    router.push("/subscription/plans");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isLoaded || !isSignedIn) {
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
            <Text style={styles.title}>Subscription Management</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Current Plan Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Plan</Text>
            <View style={styles.planDetails}>
              <Text style={styles.planName}>Premium Plan</Text>
              <Text style={styles.planStatus}>Active</Text>
            </View>
          </View>

          {/* Plan Actions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Actions</Text>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleChangePlan}
              style={styles.actionButton}
            >
              Change Plan
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={() => setShowCancelConfirm(true)}
              style={styles.actionButton}
            >
              Cancel Subscription
            </Button>
          </View>

          {/* Cancellation Confirmation Modal */}
          {showCancelConfirm && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cancel Subscription?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to cancel your subscription? You'll lose
                  access to premium features at the end of your current billing
                  period.
                </Text>
                <View style={styles.modalButtons}>
                  <Button
                    variant="secondary"
                    size="md"
                    onPress={() => setShowCancelConfirm(false)}
                    style={styles.modalButton}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onPress={handleCancelSubscription}
                    style={styles.modalButton}
                    loading={loading}
                  >
                    Yes, Cancel
                  </Button>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  planDetails: {
    gap: SPACING.sm,
  },
  planName: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  planStatus: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.regular,
    color: COLORS.textPrimary,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.regular,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});
