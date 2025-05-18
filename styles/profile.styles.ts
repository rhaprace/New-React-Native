import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONT, SPACING, RADIUS, SHADOW } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.sm,
    fontSize: FONT.size.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    color: COLORS.textPrimary,
  },
  editIcon: {
    marginLeft: SPACING.sm,
  },
  selectButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButtonText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    ...SHADOW.sm,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  option: {
    paddingVertical: SPACING.md,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: FONT.size.lg,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: COLORS.secondary,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  closeButtonText: {
    textAlign: "center",
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.textOnSecondary,
  },
});
