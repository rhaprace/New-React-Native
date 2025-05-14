import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
  isTrialActivation: boolean;
  trialEndDate?: string;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({
  visible,
  onClose,
  isTrialActivation,
  trialEndDate,
}) => {
  // Format the trial end date if provided
  const formattedEndDate = trialEndDate
    ? new Date(trialEndDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Success icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={COLORS.success}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isTrialActivation
              ? "Trial Successfully Activated!"
              : "Thank You for Your Purchase!"}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {isTrialActivation
              ? `Your 30-day free trial has been activated. You now have full access to all features until ${formattedEndDate}.`
              : "Your subscription has been successfully processed. You now have full access to all premium features."}
          </Text>

          {/* Features list */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.featureText}>Full access to all workouts</Text>
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
            {!isTrialActivation && (
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>Premium support</Text>
              </View>
            )}
          </View>

          {/* Continue button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onClose}
            style={styles.button}
          >
            Start Using the App
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 400,
    ...SHADOW.lg,
  },
  closeButton: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  button: {
    marginTop: SPACING.md,
  },
});

export default ThankYouModal;
