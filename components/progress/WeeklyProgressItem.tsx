import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import CircularProgress from "react-native-circular-progress-indicator";
import { Text } from "@/components/ui";
import { COLORS, SLATE, SPACING } from "@/constants/theme";
import { styles } from "@/styles/progress.style";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProgressItemData {
  day: string;
  caloriesBurned: number;
  workoutsCompleted: number;
  steps: number;
  goalSteps: number;
}

interface WeeklyProgressItemProps {
  item: ProgressItemData;
  index: number;
  isExpanded: boolean;
  onToggle: (day: string) => void;
}

const WeeklyProgressItem: React.FC<WeeklyProgressItemProps> = ({
  item,
  index,
  isExpanded,
  onToggle,
}) => {
  const [realSteps, setRealSteps] = useState<number | null>(null);
  const [realGoal, setRealGoal] = useState<number | null>(null);

  // Get day of week from date
  const getDayOfWeek = (dateString: string) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Load step data from storage
  useEffect(() => {
    const loadStepData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("atle_step_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Find data for the current day
          const dayData = parsedData.find(
            (data: any) => getDayOfWeek(data.date) === item.day
          );

          if (dayData) {
            setRealSteps(dayData.steps);
            setRealGoal(dayData.goal);
          }
        }
      } catch (error) {
        console.error("Error loading step data:", error);
      }
    };

    loadStepData();
  }, [item.day]);

  // Use real step data if available, otherwise use mock data
  const steps = realSteps !== null ? realSteps : item.steps;
  const goalSteps = realGoal !== null ? realGoal : item.goalSteps;

  const stepProgress = (steps / goalSteps) * 100;
  const goalReached = steps >= goalSteps;

  // Get day icon based on progress
  const getDayIcon = () => {
    if (goalReached) {
      return "checkmark-circle";
    } else if (stepProgress >= 50) {
      return "time";
    } else {
      return "walk";
    }
  };

  // Get icon color based on progress
  const getIconColor = () => {
    if (goalReached) {
      return COLORS.success;
    } else if (stepProgress >= 50) {
      return SLATE.slate_500;
    } else {
      return SLATE.slate_400;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay((index + 2) * 100).springify()}
      style={styles.dayContainer}
    >
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => onToggle(item.day)}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeaderContent}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={getDayIcon()}
              size={20}
              color={getIconColor()}
              style={{ marginRight: 8 }}
            />
            <Text variant="body2" weight="medium" style={styles.dayText}>
              {item.day}
            </Text>
          </View>
          <View style={styles.dailyTotalsContainer}>
            <Text
              variant="caption"
              color="secondary"
              style={styles.dailyTotalsText}
            >
              {item.caloriesBurned} cal burned | {steps} steps
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={SLATE.slate_600}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.progressContainer}>
            <CircularProgress
              value={stepProgress > 100 ? 100 : stepProgress}
              radius={55}
              duration={1000}
              progressValueColor={SLATE.slate_700}
              maxValue={100}
              title={"Steps Progress"}
              titleColor={SLATE.slate_500}
              titleStyle={{ fontSize: 14, fontWeight: "500" }}
              activeStrokeColor={goalReached ? COLORS.success : SLATE.slate_700}
              inActiveStrokeColor={SLATE.slate_200}
              inActiveStrokeOpacity={0.5}
              activeStrokeWidth={12}
              inActiveStrokeWidth={12}
              valueSuffix="%"
              subtitle={`${steps} / ${goalSteps}`}
              subtitleStyle={{ fontSize: 12, color: SLATE.slate_500 }}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h5" weight="bold" style={styles.statValue}>
                {item.workoutsCompleted}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={styles.statLabel}
              >
                Workouts
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="h5" weight="bold" style={styles.statValue}>
                {item.caloriesBurned}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={styles.statLabel}
              >
                Calories Burned
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="h5" weight="bold" style={styles.statValue}>
                {steps}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={styles.statLabel}
              >
                Steps
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.goalMessage,
              goalReached
                ? styles.goalMessageSuccess
                : styles.goalMessagePending,
            ]}
          >
            <Text
              variant="body2"
              color={goalReached ? "success" : "secondary"}
              weight="medium"
            >
              {goalReached
                ? "🎉 You've reached your step goal for today!"
                : `${Math.round(stepProgress)}% of your daily step goal completed`}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default WeeklyProgressItem;
