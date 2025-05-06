import { Tabs } from "expo-router";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { View, Keyboard, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SLATE } from "@/constants/theme";
import { Text } from "@/components/ui";

export default function TabLayout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isTabsReady, setIsTabsReady] = useState(false);

  // Mark tabs as ready after first render
  useEffect(() => {
    setIsTabsReady(true);
  }, []);

  // Add keyboard listeners
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

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Show loading indicator if tabs aren't ready
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
    <LinearGradient
      colors={[SLATE.slate_900, SLATE.slate_800]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textTertiary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopWidth: 0,
              position: "absolute",
              elevation: 0,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              bottom: 0,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              // Hide the tab bar when keyboard is visible
              display: isKeyboardVisible ? "none" : "flex",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ size, color }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="meal"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="utensils" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="progress"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="chart-line" size={size} color={color} />
              ),
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
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              tabBarIcon: ({ size, color }) => (
                <Ionicons
                  name="chatbubble-ellipses"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ size, color }) => (
                <FontAwesome5 name="user" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </LinearGradient>
  );
}
