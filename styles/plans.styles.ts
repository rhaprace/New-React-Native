import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: FONT.size.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  planTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  trialBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  trialText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  savingsText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  priceContainer: {
    marginBottom: SPACING.lg,
  },
  price: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  billingCycle: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  regularPrice: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
    marginTop: SPACING.xs,
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  trialButtons: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  trialButton: {
    marginBottom: SPACING.md,
    height: 50, // Set a fixed height for buttons
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: "90%",
    maxWidth: 400,
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  modalText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  securityText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  inputLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  phonePrefix: {
    backgroundColor: COLORS.slate_100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
  },
  inputHint: {
    fontSize: FONT.size.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    width: "100%",
  },
  closeButton: {
    padding: SPACING.xs,
  },
});
