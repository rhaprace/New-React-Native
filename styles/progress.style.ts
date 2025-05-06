import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOW, SLATE, FONT } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLATE.slate_50,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SLATE.slate_50,
  },
  bottomPadding: {
    height: 100,
  },
  header: {
    backgroundColor: SLATE.slate_800,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: SPACING.lg,
    ...SHADOW.lg,
    borderWidth: 1,
    borderColor: SLATE.slate_700,
  },
  headerTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT.size.md,
    color: SLATE.slate_300,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 4,
    borderLeftColor: SLATE.slate_700,
    paddingLeft: SPACING.md,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  dayContainer: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: SLATE.slate_200,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: SLATE.slate_100,
    borderBottomWidth: 1,
    borderBottomColor: SLATE.slate_200,
  },
  dayHeaderContent: {
    flex: 1,
  },
  dayText: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: SLATE.slate_800,
  },
  dailyTotalsContainer: {
    marginTop: 4,
  },
  dailyTotalsText: {
    fontSize: FONT.size.sm,
    color: SLATE.slate_500,
  },
  detailsContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    margin: SPACING.sm,
  },
  detailsText: {
    fontSize: FONT.size.sm,
    color: SLATE.slate_700,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: SLATE.slate_50,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOW.sm,
  },
  statItem: {
    alignItems: "center",
    padding: SPACING.sm,
    minWidth: 80,
  },
  statValue: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: SLATE.slate_700,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT.size.xs,
    color: SLATE.slate_500,
    fontWeight: FONT.weight.medium,
  },
  chartCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: SLATE.slate_200,
  },
  goalMessage: {
    textAlign: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: SLATE.slate_100,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  goalMessageSuccess: {
    borderLeftColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  goalMessagePending: {
    borderLeftColor: SLATE.slate_500,
    backgroundColor: `${SLATE.slate_500}10`,
  },
  weightGoalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: SLATE.slate_200,
  },
  weightGoalLabel: {
    color: SLATE.slate_700,
    marginRight: SPACING.sm,
  },
  weightGoalButtons: {
    flexDirection: 'row',
  },
  weightGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.xs,
    backgroundColor: SLATE.slate_100,
  },
  selectedWeightGoalButton: {
    backgroundColor: COLORS.primary,
  },
  weightGoalButtonText: {
    fontSize: FONT.size.sm,
    color: SLATE.slate_700,
    marginLeft: 4,
  },
  selectedWeightGoalButtonText: {
    color: COLORS.white,
  },
});
