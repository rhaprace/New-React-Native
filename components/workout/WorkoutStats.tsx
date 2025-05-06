import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/workout.styles";

interface WorkoutStatsProps {
  totalCalories: number;
  totalMinutes: number;
  onViewHistory: () => void;
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  totalCalories,
  totalMinutes,
  onViewHistory,
}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="fire" size={24} color={COLORS.error} />
        <Text style={styles.statValue}>{totalCalories}</Text>
        <Text style={styles.statLabel}>Calories Burned</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={24}
          color={COLORS.primary}
        />
        <Text style={styles.statValue}>{totalMinutes}</Text>
        <Text style={styles.statLabel}>Minutes</Text>
      </View>
      <TouchableOpacity
        style={styles.statCard}
        onPress={onViewHistory}
      >
        <MaterialCommunityIcons
          name="chart-bar"
          size={24}
          color={COLORS.secondary}
        />
        <Text style={styles.statValue}>View</Text>
        <Text style={styles.statLabel}>History</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutStats;
