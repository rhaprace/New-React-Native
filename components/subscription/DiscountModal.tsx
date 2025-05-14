import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "@/components/ui/BaseModal";
import Button from "@/components/ui/Button";

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
            <Text style={styles.timerText}>
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left on your trial
            </Text>
          </View>

          {/* Discount message */}
          <Text style={styles.message}>
            {showPromoOffer
              ? "Your free trial is ending soon! Add a payment method now to continue with our special 3-month promo rate."
              : "Your free trial is ending soon! We've prepared special discounted plans just for you."}
          </Text>

          {/* Monthly Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Monthly Plan</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>62% OFF</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>₱200.00</Text>
              <Text style={styles.discountedPrice}>₱75.00</Text>
              <Text style={styles.billingCycle}>
                {showPromoOffer ? "for first 3 months" : "per month"}
              </Text>
              {showPromoOffer && (
                <Text style={styles.promoNote}>
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
                <Text style={styles.featureText}>
                  Full access to all workouts
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
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>

            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Yearly Plan</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>75% OFF</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>₱1,200.00</Text>
              <Text style={styles.discountedPrice}>₱300.00</Text>
              <Text style={styles.billingCycle}>per year (₱25/month)</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>
                  All monthly plan features
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>
                  Exclusive premium content
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>Save 67% vs monthly plan</Text>
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

          {/* Free Trial Option */}
          <TouchableOpacity
            style={styles.freeTrialButton}
            onPress={onSelectFreeTrial}
          >
            <Text style={styles.freeTrialText}>
              Continue with free trial (GCash linking required)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 600,
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
