import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/styles/workout.styles";
import { getWorkoutsByGoal } from "@/constants/workoutData";
import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface WeeklyPlanProps {
  currentDay: string;
  weightGoal?: "loss" | "gain" | "maintain";
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({
  currentDay,
  weightGoal = "maintain",
}) => {
  const router = useRouter();

  // Get workouts based on the selected weight goal
  const filteredWorkouts = getWorkoutsByGoal(weightGoal);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Weekly Plan (
          {weightGoal === "loss"
            ? "Weight Loss"
            : weightGoal === "gain"
              ? "Weight Gain"
              : "Maintenance"}
          )
        </Text>
      </View>

      <FlatList
        data={filteredWorkouts}
        keyExtractor={(item) => item.day}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.weekdayCard,
              item.day === currentDay && styles.todayCard,
            ]}
            onPress={() =>
              router.push({
                pathname: "/workout/[day]",
                params: {
                  day: item.day.toLowerCase(),
                  weightGoal: weightGoal,
                },
              })
            }
          >
            <Text
              style={[
                styles.weekdayText,
                item.day === currentDay && styles.todayText,
              ]}
            >
              {item.day}
            </Text>
            <Text
              style={[
                styles.exerciseCount,
                item.day === currentDay && styles.todayText,
              ]}
            >
              {item.exercises.length} Exercises
            </Text>
            <View style={styles.weekdayActions}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={16}
                color={
                  item.day === currentDay
                    ? COLORS.textOnPrimary
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.weekdayActionText,
                  item.day === currentDay && styles.todayText,
                ]}
              >
                View
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default WeeklyPlan;
