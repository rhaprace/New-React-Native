import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS, SPACING, RADIUS, SLATE } from '@/constants/theme';

// Get the height of the tab bar to ensure proper spacing
const TAB_BAR_HEIGHT = 60;
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  inputContainer: {
    paddingBottom: Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT + 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
