import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { styles } from "@/styles/progress.style";
import { Ionicons } from "@expo/vector-icons";
import { SLATE } from "@/constants/theme";

interface ProgressHeaderProps {
  title: string;
  subtitle: string;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Ionicons name="stats-chart" size={28} color={SLATE.slate_100} />
        <Text style={[styles.headerTitle, { marginLeft: 10 }]}>{title}</Text>
      </View>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
  );
};

export default ProgressHeader;
