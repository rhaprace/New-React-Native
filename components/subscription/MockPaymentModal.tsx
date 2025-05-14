import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS, FONT, RADIUS, SPACING } from "@/constants/theme";

interface MockPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: { type: string; value: string }) => void;
  paymentType: "card" | "gcash";
}

export default function MockPaymentModal({
  visible,
  onClose,
  onSuccess,
  paymentType,
}: MockPaymentModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!value.trim()) {
      setError(
        "Please enter a valid " +
          (paymentType === "card" ? "card number" : "GCash number")
      );
      return;
    }
    setError("");
    onSuccess({ type: paymentType, value });
    setValue("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {paymentType === "card"
              ? "Enter Card Details"
              : "Enter GCash Number"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              paymentType === "card" ? "Card Number" : "GCash Number"
            }
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            maxLength={paymentType === "card" ? 16 : 11}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primary]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.primaryText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: 320,
    alignItems: "center",
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  error: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontWeight: FONT.weight.medium,
  },
  primaryText: {
    color: COLORS.textOnPrimary,
  },
});
