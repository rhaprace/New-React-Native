import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, SPACING, RADIUS, FONT } from "@/constants/theme";
import Text from "./Text";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="body2"
          weight="bold"
          color="secondary"
          style={[styles.label, labelStyle]}
        >
          {label}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          { color: COLORS.textPrimary }, // Explicitly set text color to ensure visibility
          inputStyle,
        ]}
        placeholderTextColor={COLORS.textTertiary}
        {...props}
      />

      {error && (
        <Text
          variant="caption"
          color="error"
          style={[styles.errorText, errorStyle]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
});

export default FormInput;
