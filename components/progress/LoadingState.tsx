import React from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui";
import { SLATE } from "@/constants/theme";
import { styles } from "@/styles/progress.style";
import { Ionicons } from "@expo/vector-icons";

const LoadingState: React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="dark" />
      <View style={{ alignItems: "center" }}>
        <Ionicons
          name="fitness"
          size={48}
          color={SLATE.slate_300}
          style={{ marginBottom: 16 }}
        />
        <ActivityIndicator size="large" color={SLATE.slate_700} />
        <Text
          variant="body1"
          color="secondary"
          style={{ marginTop: 16, textAlign: "center" }}
        >
          Loading your fitness progress...
        </Text>
        <Text
          variant="caption"
          color="tertiary"
          style={{ marginTop: 8, textAlign: "center", maxWidth: 250 }}
        >
          We're gathering your workout data and achievements
        </Text>
      </View>
    </View>
  );
};

export default LoadingState;
