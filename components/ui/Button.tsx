import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Text } from "@/components/ui";
import { COLORS, FONT, RADIUS, SPACING } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  children,
  ...props
}: ButtonProps) => {
  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "text":
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  // We're now using the custom Text component's props instead of text styles

  // Determine size styles
  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.smallButton;
      case "md":
        return styles.mediumButton;
      case "lg":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // We're now using the custom Text component's variant prop for text sizing

  // Combine all styles
  const buttonStyles = [
    styles.button,
    getButtonStyle(),
    getSizeStyle(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  // We're now using the custom Text component's props instead of styles

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "text"
              ? COLORS.primary
              : COLORS.textOnPrimary
          }
        />
      ) : (
        <Text
          variant="button"
          color={
            variant === "primary"
              ? "onPrimary"
              : variant === "secondary"
                ? "onSecondary"
                : "primary"
          }
          weight="semibold"
          style={textStyle}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  // Text styles
  primaryButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: FONT.weight.semibold,
  },
  secondaryButtonText: {
    color: COLORS.textOnSecondary,
    fontWeight: FONT.weight.semibold,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semibold,
  },
  textButtonText: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semibold,
  },
  // Size styles
  smallButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  mediumButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  largeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  // Text size styles
  smallButtonText: {
    fontSize: FONT.size.sm,
  },
  mediumButtonText: {
    fontSize: FONT.size.md,
  },
  largeButtonText: {
    fontSize: FONT.size.lg,
  },
  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
