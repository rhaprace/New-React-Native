import React from "react";
import {
  Text as RNText,
  StyleSheet,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { COLORS, FONT } from "@/constants/theme";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body1"
  | "body2"
  | "caption"
  | "button"
  | "overline";
type TextWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";
type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "onPrimary"
  | "onSecondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "text";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const Text = ({
  variant = "body1",
  weight = "regular",
  color = "primary",
  style,
  children,
  ...props
}: TextProps) => {
  // Determine text variant style
  const getVariantStyle = () => {
    switch (variant) {
      case "h1":
        return styles.h1;
      case "h2":
        return styles.h2;
      case "h3":
        return styles.h3;
      case "h4":
        return styles.h4;
      case "h5":
        return styles.h5;
      case "h6":
        return styles.h6;
      case "body1":
        return styles.body1;
      case "body2":
        return styles.body2;
      case "caption":
        return styles.caption;
      case "button":
        return styles.button;
      case "overline":
        return styles.overline;
      default:
        return styles.body1;
    }
  };

  // Determine text weight style
  const getWeightStyle = () => {
    switch (weight) {
      case "light":
        return styles.light;
      case "regular":
        return styles.regular;
      case "medium":
        return styles.medium;
      case "semibold":
        return styles.semibold;
      case "bold":
        return styles.bold;
      case "extrabold":
        return styles.extrabold;
      default:
        return styles.regular;
    }
  };

  // Determine text color style
  const getColorStyle = () => {
    switch (color) {
      case "primary":
        return styles.textPrimary;
      case "secondary":
        return styles.textSecondary;
      case "tertiary":
        return styles.textTertiary;
      case "onPrimary":
        return styles.textOnPrimary;
      case "onSecondary":
        return styles.textOnSecondary;
      case "error":
        return styles.textError;
      case "success":
        return styles.textSuccess;
      case "warning":
        return styles.textWarning;
      case "info":
        return styles.textInfo;
      case "text":
        return styles.textPrimary; // 'text' is an alias for 'primary'
      default:
        return styles.textPrimary;
    }
  };

  // Combine all styles
  const textStyles = [
    styles.text,
    getVariantStyle(),
    getWeightStyle(),
    getColorStyle(),
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {},
  // Variant styles
  h1: {
    fontSize: FONT.size.display,
    lineHeight: FONT.size.display * 1.2,
  },
  h2: {
    fontSize: FONT.size.xxxl,
    lineHeight: FONT.size.xxxl * 1.2,
  },
  h3: {
    fontSize: FONT.size.xxl,
    lineHeight: FONT.size.xxl * 1.2,
  },
  h4: {
    fontSize: FONT.size.xl,
    lineHeight: FONT.size.xl * 1.2,
  },
  h5: {
    fontSize: FONT.size.lg,
    lineHeight: FONT.size.lg * 1.2,
  },
  h6: {
    fontSize: FONT.size.md,
    lineHeight: FONT.size.md * 1.2,
  },
  body1: {
    fontSize: FONT.size.md,
    lineHeight: FONT.size.md * 1.5,
  },
  body2: {
    fontSize: FONT.size.sm,
    lineHeight: FONT.size.sm * 1.5,
  },
  caption: {
    fontSize: FONT.size.xs,
    lineHeight: FONT.size.xs * 1.5,
  },
  button: {
    fontSize: FONT.size.md,
    lineHeight: FONT.size.md * 1.2,
  },
  overline: {
    fontSize: FONT.size.xs,
    lineHeight: FONT.size.xs * 1.5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Weight styles
  light: {
    fontWeight: FONT.weight.light,
  },
  regular: {
    fontWeight: FONT.weight.regular,
  },
  medium: {
    fontWeight: FONT.weight.medium,
  },
  semibold: {
    fontWeight: FONT.weight.semibold,
  },
  bold: {
    fontWeight: FONT.weight.bold,
  },
  extrabold: {
    fontWeight: FONT.weight.extrabold,
  },
  // Color styles
  textPrimary: {
    color: COLORS.textPrimary,
  },
  textSecondary: {
    color: COLORS.textSecondary,
  },
  textTertiary: {
    color: COLORS.textTertiary,
  },
  textOnPrimary: {
    color: COLORS.textOnPrimary,
  },
  textOnSecondary: {
    color: COLORS.textOnSecondary,
  },
  textError: {
    color: COLORS.error,
  },
  textSuccess: {
    color: COLORS.success,
  },
  textWarning: {
    color: COLORS.warning,
  },
  textInfo: {
    color: COLORS.info,
  },
});

export default Text;
