import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  container: {
    flex: 1,
    padding: SPACING.lg,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  } as ViewStyle,
  backButton: {
    padding: SPACING.sm,
  } as ViewStyle,
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  } as TextStyle,
  placeholder: {
    width: 40,
  } as ViewStyle,
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  } as ViewStyle,
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  } as TextStyle,
  planContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  } as ViewStyle,
  planInfo: {
    flex: 1,
    marginRight: SPACING.md,
  } as ViewStyle,
  planName: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  } as TextStyle,
  planDescription: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  } as TextStyle,
  priceContainer: {
    alignItems: "flex-end",
  } as ViewStyle,
  price: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  } as TextStyle,
  originalPrice: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
    marginBottom: SPACING.xs,
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  } as ViewStyle,
  planChangeDetails: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  } as ViewStyle,
  planChangeTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  } as TextStyle,
  planChangeText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  } as TextStyle,
  paymentOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  } as ViewStyle,
  selectedPaymentOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.slate_50,
  } as ViewStyle,
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  paymentLogoContainer: {
    width: 60,
    height: 30,
    marginRight: SPACING.sm,
    justifyContent: "center",
  } as ViewStyle,
  paymentLogo: {
    width: "100%",
    height: "100%",
  } as ImageStyle,
  paymentName: {
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
  } as TextStyle,
  buttonContainer: {
    marginVertical: SPACING.lg,
  } as ViewStyle,
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,
  securityText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  } as TextStyle,
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  } as ViewStyle,
  totalLabel: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
  } as TextStyle,
  totalAmount: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  } as TextStyle,
  radioButtonContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginLeft: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  } as ViewStyle,
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.sm,
    backgroundColor: COLORS.slate_100,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  } as ViewStyle,
  statusIndicator: {
    marginRight: SPACING.xs,
  } as ViewStyle,
  statusText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.regular,
    color: COLORS.primary,
  } as TextStyle,
  securitySection: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: SPACING.md,
    backgroundColor: COLORS.slate_100,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
  } as ViewStyle,
  securityItem: {
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  termsContainer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  } as ViewStyle,
  termsText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  } as TextStyle,
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  } as TextStyle,
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  } as ViewStyle,
  processingText: {
    fontSize: FONT.size.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.lg,
  } as TextStyle,
});
export default styles;
