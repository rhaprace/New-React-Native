import { Tabs } from "expo-router";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Keyboard,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SLATE, SPACING } from "@/constants/theme";
import { Text } from "@/components/ui";
import SubscriptionGate from "@/components/SubscriptionGate";
import { SafeAreaView } from "react-native-safe-area-context";

// Define styles outside of the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLATE.slate_900,
  },
});

export default function TabLayout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isTabsReady, setIsTabsReady] = useState(false);
  useEffect(() => {
    setIsTabsReady(true);
  }, []);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  if (!isTabsReady) {
    return (
      <LinearGradient
        colors={[SLATE.slate_900, SLATE.slate_800]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text
            variant="body1"
            style={{ marginTop: 10, color: COLORS.primary }}
          >
            Loading tabs...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <SubscriptionGate>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textTertiary,
            tabBarLabel: () => null, // Return null to ensure no raw strings are used
            // Add padding to screen content
            tabBarItemStyle: {
              paddingBottom: 6,
            },
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              position: "absolute",
              elevation: 0,
              height: Platform.OS === "ios" ? 85 : 70,
              paddingBottom: Platform.OS === "ios" ? 25 : 12,
              paddingTop: 8,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              bottom: 0,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              display: isKeyboardVisible ? "none" : "flex",
              // Add safe area inset to ensure proper spacing at the bottom
              paddingHorizontal: 10,
              marginBottom: Platform.OS === "ios" ? -10 : 0,
              borderTopWidth: 0.5,
              borderTopColor: COLORS.border,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              tabBarAccessibilityLabel: "Home",
            }}
          />
          <Tabs.Screen
            name="meal"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="utensils" size={size} color={color} />
              ),
              tabBarAccessibilityLabel: "Meal",
            }}
          />
          <Tabs.Screen
            name="progress"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="chart-line" size={size} color={color} />
              ),
              tabBarAccessibilityLabel: "Progress",
            }}
          />
          <Tabs.Screen
            name="workout"
            options={{
              tabBarIcon: ({ size, color }) => (
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={size}
                  color={color}
                />
              ),
              tabBarAccessibilityLabel: "Workout",
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="mail" size={size} color={color} />
              ),
              tabBarAccessibilityLabel: "Chat",
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="user" size={size} color={color} />
              ),
              tabBarAccessibilityLabel: "Profile",
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SubscriptionGate>
  );
}
