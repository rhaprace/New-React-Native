import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";

interface CalorieTrackerProps {
  dailyCalories: number;
  totalCalories: number;
  caloriesRemaining: number;
  calorieProgress: number;
  isCalorieGoalReached: boolean;
  isCalorieGoalExceeded: boolean;
  showResetMessage: boolean;
}

const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  dailyCalories,
  totalCalories,
  caloriesRemaining,
  calorieProgress,
  isCalorieGoalReached,
  isCalorieGoalExceeded,
  showResetMessage,
}) => {
  return (
    <View style={styles.calorieContent}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="flame" size={22} color={COLORS.primary} />
          <Text variant="h5" weight="semibold" style={styles.cardTitle}>
            Calories
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.calorieNumbers}>
        <Text
          variant="h3"
          weight="bold"
          color="primary"
          style={styles.calorieGoal}
        >
          {dailyCalories}
        </Text>
        <Text
          variant="h3"
          weight="medium"
          color="secondary"
          style={styles.calorieOperator}
        >
          -
        </Text>
        <Text
          variant="h3"
          weight="bold"
          color="secondary"
          style={styles.calorieConsumed}
        >
          {totalCalories}
        </Text>
        <Text
          variant="h3"
          weight="medium"
          color="secondary"
          style={styles.calorieOperator}
        >
          =
        </Text>
        <Text
          variant="h3"
          weight="bold"
          style={[
            styles.calorieRemaining,
            isCalorieGoalExceeded
              ? { color: COLORS.error }
              : isCalorieGoalReached && { color: COLORS.warning },
          ]}
        >
          {isCalorieGoalReached
            ? caloriesRemaining < 0
              ? `+${Math.abs(caloriesRemaining)}`
              : "0"
            : caloriesRemaining}
        </Text>
      </View>
      <View style={styles.calorieLabels}>
        <Text variant="caption" color="secondary" style={styles.calorieLabel}>
          Goal
        </Text>
        <Text
          variant="caption"
          color="secondary"
          style={[styles.calorieLabel, { marginHorizontal: 30 }]}
        >
          Consumed
        </Text>
        <Text
          variant="caption"
          color={
            caloriesRemaining < 0
              ? isCalorieGoalExceeded
                ? "error"
                : "warning"
              : "secondary"
          }
          style={styles.calorieLabel}
        >
          {caloriesRemaining < 0 ? "Excess" : "Remaining"}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${calorieProgress}%`,
              backgroundColor: isCalorieGoalExceeded
                ? COLORS.error
                : isCalorieGoalReached
                  ? COLORS.warning
                  : COLORS.primary,
            },
          ]}
        />
      </View>
      {isCalorieGoalReached && (
        <View
          style={[
            styles.goalReachedContainer,
            isCalorieGoalExceeded && styles.goalExceededContainer,
          ]}
        >
          <Text
            variant="body2"
            weight="semibold"
            color={isCalorieGoalExceeded ? "error" : "warning"}
            style={styles.goalReachedText}
          >
            {isCalorieGoalExceeded
              ? "You've exceeded your daily calorie goal by more than 10%!"
              : "You've reached your daily calorie goal!"}
          </Text>
          <Text
            variant="caption"
            color={isCalorieGoalExceeded ? "error" : "warning"}
            style={styles.goalReachedSubtext}
          >
            {isCalorieGoalExceeded
              ? "Consider adjusting your intake tomorrow."
              : "Great job tracking your nutrition today!"}
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={styles.goalReachedNote}
          >
            Your progress will automatically reset tomorrow.
          </Text>
        </View>
      )}
      {showResetMessage && (
        <View style={styles.goalResetContainer}>
          <Text variant="caption" color="success" style={styles.goalResetText}>
            Your calorie goal has been reset for today!
          </Text>
        </View>
      )}
    </View>
  );
};

export default CalorieTracker;
