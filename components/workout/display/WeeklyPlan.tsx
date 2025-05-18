import React from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/styles/workout.styles";
import { getWorkoutsByGoal } from "@/constants/workoutData";
import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";

interface WeeklyPlanProps {
  currentDay: string;
  weightGoal?: "loss" | "gain" | "maintain";
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({
  currentDay,
  weightGoal = "maintain",
}) => {
  const router = useRouter();
  const filteredWorkouts = getWorkoutsByGoal(weightGoal);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text variant="h5" weight="semibold">
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
              variant="body1"
              weight="semibold"
              color={item.day === currentDay ? "onPrimary" : "primary"}
            >
              {item.day}
            </Text>
            <Text
              variant="body2"
              color={item.day === currentDay ? "onPrimary" : "secondary"}
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
                variant="caption"
                color={item.day === currentDay ? "onPrimary" : "secondary"}
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
