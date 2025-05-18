import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { COLORS, FONT, SPACING } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface Styles {
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  closeButton: ViewStyle;
  modalIconContainer: ViewStyle;
  modalTitle: TextStyle;
  modalMessage: TextStyle;
  modalFeatures: ViewStyle;
  featureRow: ViewStyle;
  featureText: TextStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
  modalSecondaryButton: ViewStyle;
  modalSecondaryButtonText: TextStyle;
  primaryButtonText: TextStyle;
}

const RestrictedAccess = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.textOnPrimary} />
          </TouchableOpacity>{" "}
          <View style={styles.modalIconContainer}>
            <Ionicons
              name="lock-closed"
              size={48}
              color="rgba(255, 255, 255, 0.15)"
            />
          </View>{" "}
          <Text variant="h4" weight="bold" style={styles.modalTitle}>
            Premium Feature
          </Text>{" "}
          <Text style={[styles.modalMessage]}>
            This feature requires an active subscription or trial. Unlock all
            features and start your fitness journey today!
          </Text>
          <View style={styles.modalFeatures}>
            {[
              "Personalized workout plans",
              "Detailed progress tracking",
              "Nutrition guidance",
            ].map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                {" "}
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setVisible(false);
              router.replace("/subscription/plans");
            }}
          >
            {" "}
            <Text
              variant="button"
              weight="bold"
              style={styles.primaryButtonText}
            >
              View Subscription Plans
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalSecondaryButton}
            onPress={() => {
              setVisible(false);
              router.replace("/");
            }}
          >
            {" "}
            <Text variant="button" style={styles.modalSecondaryButtonText}>
              Return to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create<Styles>({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: SPACING.md,
    top: SPACING.md,
    zIndex: 1,
  },
  modalIconContainer: {
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT.size.xl,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: FONT.size.md,
    color: COLORS.textOnPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  modalFeatures: {
    width: "100%",
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  featureText: {
    marginLeft: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textOnPrimary,
    opacity: 0.9,
  },
  modalButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FONT.size.md,
  },
  modalSecondaryButton: {
    width: "100%",
    padding: SPACING.sm,
  },
  modalSecondaryButtonText: {
    color: COLORS.primary,
    textAlign: "center",
    fontSize: FONT.size.md,
  },
  primaryButtonText: {
    color: COLORS.textOnPrimary,
    textAlign: "center",
  },
});

export default RestrictedAccess;
