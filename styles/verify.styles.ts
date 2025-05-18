import { StyleSheet, Platform } from "react-native";
import { COLORS, RADIUS, FONT, SPACING } from "@/constants/theme";

export const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl * 2,
    alignItems: "center",
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl * 1.5,
    paddingHorizontal: SPACING.lg,
  },
  emailText: {
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    textAlign: "center",
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl * 2,
  },
  resendText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
  },
  resendButton: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  verifyButtonText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
    color: COLORS.surface,
  },
  disabledButton: {
    backgroundColor: COLORS.primary + "80", // Add opacity
  },
});
