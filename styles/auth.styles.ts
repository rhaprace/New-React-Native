import { COLORS, RADIUS, SHADOW, FONT, SPACING } from "@/constants/theme";
import { StyleSheet, Dimensions } from "react-native";

const {width, height} = Dimensions.get("window")

export const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.12,
  },
  logoContainer:{
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustration: {
    width: width * 0.75,
    height: width * 0.75,
    maxHeight: 280,
  },
  loginSection: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  googleButton:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
    marginBottom: 20,
    width: "100%",
    maxWidth: 300,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  googleContainer:{
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText:{
    fontSize: 16,
    fontWeight:"600",
    color: COLORS.textPrimary,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textSecondary,
    maxWidth: 280,
  },
  cleanupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cleanupText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    backgroundColor: COLORS.surfaceAlt,
  },
  signOutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});