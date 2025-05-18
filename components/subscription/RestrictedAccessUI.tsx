import React from "react";
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface RestrictedAccessUIProps {
  type?: "modal" | "screen";
  visible?: boolean;
  onClose?: () => void;
}

export const RestrictedAccessUI = ({
  type = "screen",
  visible,
  onClose,
}: RestrictedAccessUIProps) => {
  const router = useRouter();

  const content = (
    <View style={styles.content}>
      <Ionicons name="lock-closed" size={48} color={COLORS.primary} />

      <Text variant="h4" weight="bold" color="primary">
        Premium Feature
      </Text>

      <Text variant="body1" color="secondary" style={styles.message}>
        This feature requires an active subscription or trial. Unlock all
        features to start your fitness journey!
      </Text>

      <View style={styles.featureList}>
        {[
          "Personalized meal plans",
          "Nutrition tracking",
          "Meal recommendations",
          "Premium workouts",
          "Progress analytics",
        ].map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.success}
            />
            <Text variant="body1" color="text" style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={() => router.push("/subscription/plans")}
      >
        <Text variant="body1" weight="bold" color="onPrimary">
          View Subscription Plans
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (type === "modal" && visible !== undefined) {
    return (
      <LinearGradient
        colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.8)"]}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {content}
        </View>
      </LinearGradient>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

interface Styles {
  container: ViewStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  closeButton: ViewStyle;
  content: ViewStyle;
  message: TextStyle;
  featureList: ViewStyle;
  featureRow: ViewStyle;
  featureText: TextStyle;
  subscribeButton: ViewStyle;
}

const styles: Styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.xl,
    width: "100%",
    maxWidth: 400,
  },
  closeButton: {
    position: "absolute",
    right: SPACING.md,
    top: SPACING.md,
    padding: SPACING.xs,
    zIndex: 1,
  },
  content: {
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  featureList: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureText: {
    marginLeft: SPACING.sm,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
};
