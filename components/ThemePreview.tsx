import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  COLORS,
  FONT,
  SPACING,
  RADIUS,
  SHADOW,
  SLATE,
} from "@/constants/theme";
import { Button, Card, Text } from "@/components/ui";

const ColorSwatch = ({ color, name }: { color: string; name: string }) => (
  <View style={styles.swatchContainer}>
    <View style={[styles.swatch, { backgroundColor: color }]} />
    <Text variant="body2" weight="medium">
      {name}
    </Text>
    <Text variant="caption" color="tertiary">
      {color}
    </Text>
  </View>
);

const ThemePreview = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Primary Colors
        </Text>
        <Card style={styles.componentContainer}>
          <View style={styles.swatchRow}>
            <ColorSwatch color={COLORS.primary} name="Primary" />
            <ColorSwatch color={COLORS.primaryLight} name="Primary Light" />
            <ColorSwatch color={COLORS.primaryDark} name="Primary Dark" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Secondary Colors
        </Text>
        <Card style={styles.componentContainer}>
          <View style={styles.swatchRow}>
            <ColorSwatch color={COLORS.secondary} name="Secondary" />
            <ColorSwatch color={COLORS.secondaryLight} name="Secondary Light" />
            <ColorSwatch color={COLORS.secondaryDark} name="Secondary Dark" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Status Colors
        </Text>
        <Card style={styles.componentContainer}>
          <View style={styles.swatchRow}>
            <ColorSwatch color={COLORS.success} name="Success" />
            <ColorSwatch color={COLORS.warning} name="Warning" />
            <ColorSwatch color={COLORS.error} name="Error" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Background & Surface
        </Text>
        <Card style={styles.componentContainer}>
          <View style={styles.swatchRow}>
            <ColorSwatch color={COLORS.background} name="Background" />
            <ColorSwatch color={COLORS.surface} name="Surface" />
            <ColorSwatch color={COLORS.surfaceAlt} name="Surface Alt" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Text Colors
        </Text>
        <Card style={styles.componentContainer}>
          <View style={styles.swatchRow}>
            <ColorSwatch color={COLORS.textPrimary} name="Text Primary" />
            <ColorSwatch color={COLORS.textSecondary} name="Text Secondary" />
            <ColorSwatch color={COLORS.textTertiary} name="Text Tertiary" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Typography
        </Text>
        <Card style={styles.componentContainer}>
          <Text variant="h1" weight="bold" style={styles.typographyItem}>
            Display
          </Text>
          <Text variant="h2" weight="bold" style={styles.typographyItem}>
            Heading 1
          </Text>
          <Text variant="h3" weight="semibold" style={styles.typographyItem}>
            Heading 2
          </Text>
          <Text variant="h4" weight="semibold" style={styles.typographyItem}>
            Heading 3
          </Text>
          <Text variant="h5" weight="medium" style={styles.typographyItem}>
            Subtitle
          </Text>
          <Text variant="body1" style={styles.typographyItem}>
            Body Text - This is how your main content will look like in the app.
          </Text>
          <Text variant="body2" style={styles.typographyItem}>
            Body 2 - Slightly smaller text for secondary content.
          </Text>
          <Text
            variant="caption"
            color="tertiary"
            style={styles.typographyItem}
          >
            Caption - Smaller text for captions and secondary information.
          </Text>
          <Text
            variant="button"
            weight="semibold"
            style={styles.typographyItem}
          >
            BUTTON TEXT
          </Text>
          <Text
            variant="overline"
            color="secondary"
            style={styles.typographyItem}
          >
            OVERLINE TEXT
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Buttons
        </Text>
        <Card style={styles.componentContainer}>
          <Button variant="primary" style={styles.buttonSpacing}>
            Primary Button
          </Button>
          <Button variant="secondary" style={styles.buttonSpacing}>
            Secondary Button
          </Button>
          <Button variant="outline" style={styles.buttonSpacing}>
            Outline Button
          </Button>
          <Button variant="text">Text Button</Button>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          Cards
        </Text>
        <View style={styles.cardContainer}>
          <Card variant="default" elevation="sm" style={styles.cardSpacing}>
            <Text variant="h6" weight="semibold" style={styles.cardTitle}>
              Default Card
            </Text>
            <Text variant="body2">
              This card has a small shadow applied to it.
            </Text>
          </Card>

          <Card variant="filled" elevation="md" style={styles.cardSpacing}>
            <Text variant="h6" weight="semibold" style={styles.cardTitle}>
              Filled Card
            </Text>
            <Text variant="body2">
              This card has a medium shadow and filled background.
            </Text>
          </Card>

          <Card variant="outlined" elevation="none">
            <Text variant="h6" weight="semibold" style={styles.cardTitle}>
              Outlined Card
            </Text>
            <Text variant="body2">
              This card has an outline instead of a shadow.
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  componentContainer: {
    padding: SPACING.md,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  swatchContainer: {
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  swatch: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typographyItem: {
    marginBottom: SPACING.md,
  },
  cardContainer: {
    gap: SPACING.md,
  },
  cardSpacing: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginBottom: SPACING.xs,
  },
  buttonSpacing: {
    marginBottom: SPACING.md,
  },
});

export default ThemePreview;
