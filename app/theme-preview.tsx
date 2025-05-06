import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import ThemePreview from "@/components/ThemePreview";
import { COLORS, FONT } from "@/constants/theme";

export default function ThemePreviewScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: "Theme Preview",
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: FONT.weight.semibold,
          },
        }}
      />
      <ThemePreview />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
