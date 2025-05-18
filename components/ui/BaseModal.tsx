import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOW } from "@/constants/theme";
import Text from "./Text";
import Button from "./Button";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseIcon?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseIcon = false,
  contentStyle,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, contentStyle]}>
          {title && (
            <View style={styles.modalHeader}>
              <Text
                variant="h4"
                weight="bold"
                color="primary"
                style={styles.modalTitle}
              >
                {title}
              </Text>
              {showCloseIcon && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.modalBody}>{children}</View>

          {(primaryAction || secondaryAction) && (
            <View style={styles.modalFooter}>
              {primaryAction && (
                <Button
                  variant="primary"
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.disabled}
                  loading={primaryAction.loading}
                  style={styles.primaryButton}
                >
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction && (
                <Button
                  variant="secondary"
                  onPress={secondaryAction.onPress}
                  disabled={secondaryAction.disabled}
                  style={styles.secondaryButton}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end", // This will make modal slide from bottom
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    width: "100%",
    maxWidth: 500,
    padding: SPACING.lg,
    ...SHADOW.lg,
    elevation: 8, // Increased elevation for Android
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    flex: 1,
  },
  modalBody: {
    marginBottom: SPACING.md,
  },
  modalFooter: {
    marginTop: SPACING.md,
  },
  primaryButton: {
    marginBottom: SPACING.xs,
  },
  secondaryButton: {
    marginTop: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.xs,
  },
});

export default BaseModal;
