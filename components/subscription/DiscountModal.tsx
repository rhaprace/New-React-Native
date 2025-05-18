import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { linkGCashAccount } from "@/services/paymentService";
import { useRouter } from "expo-router";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "@/components/ui/BaseModal";
import Button from "@/components/ui/Button";
import { Text } from "@/components/ui";

interface DiscountModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMonthlyPlan: () => void;
  onSelectYearlyPlan: () => void;
  onSelectFreeTrial: () => void;
  daysLeft: number;
  showPromoOffer?: boolean;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  visible,
  onClose,
  onSelectMonthlyPlan,
  onSelectYearlyPlan,
  onSelectFreeTrial,
  daysLeft,
  showPromoOffer = false,
}) => {
  const [isLinkingGCash, setIsLinkingGCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Get user information
  const user = useQuery(api.users.getUser);
  const saveGCashNumber = useMutation(api.subscription.saveGCashNumber);

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const handleLinkGCash = async () => {
    if (
      !phoneNumber ||
      phoneNumber.length !== 11 ||
      !phoneNumber.startsWith("09")
    ) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 11-digit Philippine mobile number starting with 09."
      );
      return;
    }

    setLoading(true);
    try {
      const { customerId, paymentMethodId } = await linkGCashAccount(
        phoneNumber,
        user?.fullname || "",
        user?.email || ""
      );

      await saveGCashNumber({
        phoneNumber,
        paymongoCustomerId: customerId,
        paymongoPaymentMethodId: paymentMethodId,
      });

      setLoading(false);
      setIsLinkingGCash(false);
      // Call the onSelectFreeTrial after successful linking
      onSelectFreeTrial();
    } catch (error) {
      setLoading(false);
      console.error("Error linking GCash account:", error);
      Alert.alert(
        "Error",
        "There was an error linking your GCash account. Please try again."
      );
    }
  };
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Special Offer Just For You!"
      showCloseIcon={true}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header with timer */}
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color={COLORS.error} />
            <Text
              variant="body2"
              weight="semibold"
              color="error"
              style={{ marginLeft: SPACING.xs }}
            >
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left on your trial
            </Text>
          </View>

          {/* Discount message */}
          <Text
            variant="body1"
            color="secondary"
            style={{
              textAlign: "center",
              marginBottom: SPACING.lg,
              lineHeight: 22,
            }}
          >
            {showPromoOffer
              ? "Your free trial is ending soon! Add a payment method now to continue with our special 3-month promo rate."
              : "Your free trial is ending soon! We've prepared special discounted plans just for you."}
          </Text>

          {/* Monthly Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text variant="h5" weight="bold" color="primary">
                Monthly Plan
              </Text>
              <View style={styles.discountBadge}>
                <Text variant="caption" weight="bold" color="onPrimary">
                  62% OFF
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text
                variant="body2"
                color="secondary"
                style={{ textDecorationLine: "line-through" }}
              >
                ₱200.00
              </Text>
              <Text variant="h3" weight="bold" color="primary">
                ₱75.00
              </Text>
              <Text variant="caption" color="secondary">
                {showPromoOffer ? "for first 3 months" : "per month"}
              </Text>
              {showPromoOffer && (
                <Text
                  variant="body2"
                  color="secondary"
                  style={{ marginTop: SPACING.xs, fontStyle: "italic" }}
                >
                  Then ₱200.00 per month after promo period
                </Text>
              )}
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Full access to all workouts
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Personalized meal plans
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Progress tracking
                </Text>
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={onSelectMonthlyPlan}
              style={styles.planButton}
            >
              Choose Monthly Plan
            </Button>
          </View>

          {/* Yearly Plan */}
          <View style={[styles.planCard, styles.bestValueCard]}>
            <View style={styles.bestValueBadge}>
              <Text variant="caption" weight="bold" color="onPrimary">
                BEST VALUE
              </Text>
            </View>

            <View style={styles.planHeader}>
              <Text variant="h5" weight="bold" color="primary">
                Yearly Plan
              </Text>
              <View style={styles.discountBadge}>
                <Text variant="caption" weight="bold" color="onPrimary">
                  75% OFF
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text
                variant="body2"
                color="secondary"
                style={{ textDecorationLine: "line-through" }}
              >
                ₱1,200.00
              </Text>
              <Text variant="h3" weight="bold" color="primary">
                ₱300.00
              </Text>
              <Text variant="caption" color="secondary">
                per year (₱25/month)
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  All monthly plan features
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Priority support
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Exclusive premium content
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text
                  variant="body2"
                  color="primary"
                  style={{ marginLeft: SPACING.xs }}
                >
                  Save 67% vs monthly plan
                </Text>
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={onSelectYearlyPlan}
              style={styles.planButton}
            >
              Choose Yearly Plan
            </Button>
          </View>

          {/* Free Trial with GCash Option */}
          {isLinkingGCash ? (
            <View style={styles.gcashContainer}>
              <Text
                variant="h5"
                weight="bold"
                color="primary"
                style={{ marginBottom: SPACING.md, textAlign: "center" }}
              >
                Link Your GCash Account
              </Text>

              <Text
                variant="body2"
                color="secondary"
                style={{ marginBottom: SPACING.lg, textAlign: "center" }}
              >
                To activate your free 30-day trial, please link your GCash
                account. No charges will be made during the trial period.
              </Text>

              {/* Security Note */}
              <View style={styles.securityNote}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.securityText}>
                  Your payment information is securely processed and will only
                  be charged after your free trial ends
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>GCash Phone Number</Text>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.phonePrefix}>+63</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9XX XXX XXXX"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    maxLength={11}
                  />
                </View>
                <Text style={styles.inputHint}>
                  Enter the phone number associated with your GCash account
                </Text>
              </View>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={handleLinkGCash}
                loading={loading}
                disabled={loading}
                style={styles.linkButton}
              >
                {loading ? "Linking..." : "Link GCash & Activate Free Trial"}
              </Button>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setIsLinkingGCash(false)}
              >
                <Text variant="body2" color="secondary">
                  Back to plans
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.freeTrialContainer}>
              <Text
                variant="h5"
                weight="bold"
                color="primary"
                style={{ marginBottom: SPACING.sm, textAlign: "center" }}
              >
                Start with a Free Trial
              </Text>
              <Text
                variant="body2"
                color="secondary"
                style={{ marginBottom: SPACING.md, textAlign: "center" }}
              >
                Link your GCash account to start a 30-day free trial. No charges
                during the trial period.
              </Text>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onPress={() => setIsLinkingGCash(true)}
                style={styles.freeTrialButton}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={{ marginLeft: SPACING.xs }}>
                    Link GCash and Start Free Trial
                  </Text>
                </View>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
  },
  gcashContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  phonePrefix: {
    backgroundColor: COLORS.slate_100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
  },
  inputHint: {
    fontSize: FONT.size.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  linkButton: {
    marginBottom: SPACING.md,
  },
  backButton: {
    alignItems: "center",
    padding: SPACING.sm,
  },
  container: {
    paddingBottom: SPACING.lg,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    backgroundColor: COLORS.slate_100,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  timerText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  message: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  bestValueCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    position: "relative",
    paddingTop: SPACING.lg + 10,
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: [{ translateX: -60 }],
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    zIndex: 1,
  },
  bestValueText: {
    color: COLORS.white,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  planTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  discountBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },
  priceContainer: {
    marginBottom: SPACING.md,
  },
  originalPrice: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
  billingCycle: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
  },
  featuresContainer: {
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: FONT.size.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  planButton: {
    marginTop: SPACING.sm,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  securityText: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  freeTrialContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  freeTrialButton: {
    alignItems: "center",
    padding: SPACING.sm,
  },
  freeTrialText: {
    fontSize: FONT.size.sm,
    color: COLORS.secondary,
    textDecorationLine: "underline",
  },
  promoNote: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
});

export default DiscountModal;
