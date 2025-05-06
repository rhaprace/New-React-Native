// Slate color palette
export const SLATE = {
  slate_50: "#F8FAFC",
  slate_100: "#F1F5F9",
  slate_200: "#E2E8F0",
  slate_300: "#CBD5E1",
  slate_400: "#94A3B8",
  slate_500: "#64748B",
  slate_600: "#475569",
  slate_700: "#334155",
  slate_800: "#1E293B",
  slate_900: "#0F172A",
  slate_950: "#020617",
} as const;

// Base colors
export const BASE = {
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const COLORS = {
  // Primary brand colors
  primary: SLATE.slate_700,
  primaryLight: SLATE.slate_600,
  primaryDark: SLATE.slate_800,

  // Secondary accent colors
  secondary: SLATE.slate_500,
  secondaryLight: SLATE.slate_400,
  secondaryDark: SLATE.slate_600,

  // Success, warning, error, info states
  success: "#4ADE80", // Green for success messages
  warning: "#FB8500", // Orange for warnings
  error: "#EF233C", // Red for errors
  info: "#3B82F6", // Blue for informational messages

  // Background and surface colors
  background: SLATE.slate_50,
  surface: BASE.white,
  surfaceAlt: SLATE.slate_100,
  surfaceLight: SLATE.slate_200,

  // Text colors
  textPrimary: SLATE.slate_900,
  textSecondary: SLATE.slate_600,
  textTertiary: SLATE.slate_400,
  textOnPrimary: BASE.white,
  textOnSecondary: BASE.white,

  // Border and divider colors
  border: SLATE.slate_300,
  divider: SLATE.slate_200,

  // Slate colors (direct references)
  ...SLATE,

  // Legacy colors (kept for backward compatibility)
  white: BASE.white,
  gray: SLATE.slate_500,
  black: BASE.black,
} as const;

// Typography scale
export const FONT = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  weight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
} as const;

// Shadows
export const SHADOW = {
  sm: {
    shadowColor: SLATE.slate_900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: SLATE.slate_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: SLATE.slate_900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
