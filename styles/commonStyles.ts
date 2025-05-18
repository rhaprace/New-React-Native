import { StyleSheet } from "react-native";
import { COLORS, SLATE, SHADOW, SPACING } from "@/constants/theme";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLATE.slate_50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SLATE.slate_50,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOW.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textOnPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textOnPrimary,
    opacity: 0.8,
    paddingBottom: 20,
  },
});
