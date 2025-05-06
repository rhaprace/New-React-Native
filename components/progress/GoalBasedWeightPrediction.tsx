import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { COLORS, SLATE } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface GoalBasedWeightPredictionProps {
  userId: Id<"users">;
  currentWeight: number;
  weightGoal: "loss" | "gain" | "maintain";
}

interface Milestone {
  description: string;
  days: number;
  weight: string;
}

interface BodyComposition {
  initialBodyFat: number;
  finalBodyFat: number;
  fatMassChange: number;
  leanMassChange: number;
}

interface ExerciseRecommendations {
  cardioMinutesPerWeek: number;
  strengthTrainingPerWeek: number;
  stepsPerDay: number;
}

interface Recommendations {
  calories: number;
  protein: number;
  exercise: ExerciseRecommendations;
  mealPlanType: string;
}

interface PredictionData {
  weightGoal: "loss" | "gain" | "maintain";
  intensity: "slow" | "moderate" | "fast";
  dailyRate: number;
  weeklyRate: number;
  predictedWeights: number[];
  dates: string[];
  milestones: Milestone[];
  bodyComposition: BodyComposition;
  calorieDeficit: number;
  recommendations: Recommendations;
}

const GoalBasedWeightPrediction: React.FC<GoalBasedWeightPredictionProps> = ({
  userId,
  currentWeight,
  weightGoal,
}) => {
  const [intensity, setIntensity] = useState<"slow" | "moderate" | "fast">(
    "moderate"
  );

  // Get prediction based on goal
  const prediction = useQuery(api.weightPrediction.getPredictionByGoal, {
    userId,
    weightGoal,
    intensity,
    daysToPredict: 90,
  });

  if (!prediction || !prediction.success) {
    return (
      <View style={styles.container}>
        <Text variant="body1" color="secondary" style={styles.loadingText}>
          Loading prediction...
        </Text>
      </View>
    );
  }

  const { targetWeight, prediction: predictionData } = prediction;
  const predictionTyped = predictionData as PredictionData;
  const { milestones, recommendations, bodyComposition, calorieDeficit } =
    predictionTyped;

  // Format date to display
  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get icon for weight goal
  const getGoalIcon = () => {
    switch (weightGoal) {
      case "loss":
        return "trending-down";
      case "gain":
        return "trending-up";
      case "maintain":
        return "trending-neutral";
      default:
        return "scale-bathroom";
    }
  };

  // Get color for weight goal
  const getGoalColor = (): "success" | "warning" | "secondary" | "primary" => {
    switch (weightGoal) {
      case "loss":
        return "success";
      case "gain":
        return "warning";
      case "maintain":
        return "secondary";
      default:
        return "primary";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={22}
            color={COLORS.primary}
          />
          <Text variant="h5" weight="semibold" style={styles.title}>
            Weight Prediction
          </Text>
        </View>
      </View>

      <View style={styles.goalContainer}>
        <MaterialCommunityIcons
          name={getGoalIcon()}
          size={24}
          color={getGoalColor()}
        />
        <Text
          variant="body1"
          weight="semibold"
          style={{ color: getGoalColor(), marginLeft: 8 }}
        >
          {weightGoal === "loss"
            ? "Weight Loss Plan"
            : weightGoal === "gain"
              ? "Weight Gain Plan"
              : "Weight Maintenance Plan"}
        </Text>
      </View>

      <View style={styles.intensitySelector}>
        <Text variant="body2" color="secondary">
          Intensity:
        </Text>
        <View style={styles.intensityButtons}>
          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === "slow" && styles.selectedIntensityButton,
            ]}
            onPress={() => setIntensity("slow")}
          >
            <Text
              variant="caption"
              color={intensity === "slow" ? "onPrimary" : "secondary"}
            >
              Slow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === "moderate" && styles.selectedIntensityButton,
            ]}
            onPress={() => setIntensity("moderate")}
          >
            <Text
              variant="caption"
              color={intensity === "moderate" ? "onPrimary" : "secondary"}
            >
              Moderate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === "fast" && styles.selectedIntensityButton,
            ]}
            onPress={() => setIntensity("fast")}
          >
            <Text
              variant="caption"
              color={intensity === "fast" ? "onPrimary" : "secondary"}
            >
              Fast
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.predictionSummary}>
        <View style={styles.weightItem}>
          <Text variant="caption" color="secondary">
            Current
          </Text>
          <Text variant="h4" weight="bold" color="primary">
            {currentWeight} kg
          </Text>
        </View>

        <MaterialCommunityIcons
          name="arrow-right"
          size={24}
          color={COLORS.secondary}
        />

        <View style={styles.weightItem}>
          <Text variant="caption" color="secondary">
            In 90 Days
          </Text>
          <Text variant="h4" weight="bold" color={getGoalColor()}>
            {targetWeight} kg
          </Text>
        </View>
      </View>

      {milestones.length > 0 && (
        <View style={styles.milestonesContainer}>
          <Text
            variant="body1"
            weight="semibold"
            color="primary"
            style={styles.sectionTitle}
          >
            Expected Milestones
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {milestones.map(
              (
                milestone: {
                  description: string;
                  days: number;
                  weight: string;
                },
                index: number
              ) => (
                <View key={index} style={styles.milestoneCard}>
                  <Text variant="body2" weight="semibold" color="primary">
                    {milestone.description}
                  </Text>
                  <Text variant="h5" weight="bold" color={getGoalColor()}>
                    {milestone.weight} kg
                  </Text>
                  <Text variant="caption" color="secondary">
                    {formatDate(milestone.days)}
                  </Text>
                  <Text variant="caption" color="secondary">
                    ({milestone.days} days)
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      )}

      {bodyComposition && (
        <View style={styles.bodyCompositionContainer}>
          <Text
            variant="body1"
            weight="semibold"
            color="primary"
            style={styles.sectionTitle}
          >
            Body Composition Changes
          </Text>

          <View style={styles.bodyCompRow}>
            <View style={styles.bodyCompItem}>
              <Text variant="caption" color="secondary">
                Initial Body Fat
              </Text>
              <Text variant="h5" weight="bold" color="primary">
                {bodyComposition.initialBodyFat}%
              </Text>
            </View>

            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={COLORS.secondary}
            />

            <View style={styles.bodyCompItem}>
              <Text variant="caption" color="secondary">
                Final Body Fat
              </Text>
              <Text variant="h5" weight="bold" color={getGoalColor()}>
                {bodyComposition.finalBodyFat}%
              </Text>
            </View>
          </View>

          <View style={styles.bodyCompDetails}>
            <View style={styles.bodyCompDetailItem}>
              <MaterialCommunityIcons
                name={bodyComposition.fatMassChange < 0 ? "fire" : "food"}
                size={18}
                color={
                  bodyComposition.fatMassChange < 0
                    ? COLORS.success
                    : COLORS.warning
                }
              />
              <Text
                variant="body2"
                color="secondary"
                style={styles.recommendationText}
              >
                Fat Mass:{" "}
                <Text weight="bold" color="text">
                  {bodyComposition.fatMassChange > 0 ? "+" : ""}
                  {bodyComposition.fatMassChange}
                </Text>{" "}
                kg
              </Text>
            </View>

            <View style={styles.bodyCompDetailItem}>
              <MaterialCommunityIcons
                name="arm-flex"
                size={18}
                color={
                  bodyComposition.leanMassChange >= 0
                    ? COLORS.success
                    : COLORS.warning
                }
              />
              <Text
                variant="body2"
                color="secondary"
                style={styles.recommendationText}
              >
                Lean Mass:{" "}
                <Text weight="bold" color="text">
                  {bodyComposition.leanMassChange > 0 ? "+" : ""}
                  {bodyComposition.leanMassChange}
                </Text>{" "}
                kg
              </Text>
            </View>
          </View>

          {calorieDeficit && (
            <View style={styles.calorieDeficitContainer}>
              <MaterialCommunityIcons
                name="calculator"
                size={18}
                color={COLORS.primary}
              />
              <Text
                variant="body2"
                color="secondary"
                style={styles.recommendationText}
              >
                Daily Calorie {weightGoal === "loss" ? "Deficit" : "Surplus"}:{" "}
                <Text weight="bold" color="text">
                  {Math.round(calorieDeficit)}
                </Text>{" "}
                kcal
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.recommendationsContainer}>
        <Text
          variant="body1"
          weight="semibold"
          color="primary"
          style={styles.sectionTitle}
        >
          Recommendations
        </Text>

        <View style={styles.recommendationItem}>
          <MaterialCommunityIcons
            name="food-apple"
            size={20}
            color={COLORS.success}
          />
          <Text
            variant="body2"
            color="secondary"
            style={styles.recommendationText}
          >
            Daily Calories:{" "}
            <Text weight="bold" color="text">
              {recommendations.calories}
            </Text>{" "}
            kcal
          </Text>
        </View>

        <View style={styles.recommendationItem}>
          <MaterialCommunityIcons
            name="food-steak"
            size={20}
            color={COLORS.warning}
          />
          <Text
            variant="body2"
            color="secondary"
            style={styles.recommendationText}
          >
            Daily Protein:{" "}
            <Text weight="bold" color="text">
              {recommendations.protein}
            </Text>{" "}
            g
          </Text>
        </View>

        <View style={styles.recommendationItem}>
          <MaterialCommunityIcons name="run" size={20} color={COLORS.primary} />
          <Text
            variant="body2"
            color="secondary"
            style={styles.recommendationText}
          >
            Cardio:{" "}
            <Text weight="bold" color="text">
              {recommendations.exercise.cardioMinutesPerWeek}
            </Text>{" "}
            min/week
          </Text>
        </View>

        <View style={styles.recommendationItem}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={20}
            color={COLORS.secondary}
          />
          <Text
            variant="body2"
            color="secondary"
            style={styles.recommendationText}
          >
            Strength Training:{" "}
            <Text weight="bold" color="text">
              {recommendations.exercise.strengthTrainingPerWeek}
            </Text>{" "}
            days/week
          </Text>
        </View>

        <View style={styles.recommendationItem}>
          <MaterialCommunityIcons
            name="shoe-print"
            size={20}
            color={COLORS.info}
          />
          <Text
            variant="body2"
            color="secondary"
            style={styles.recommendationText}
          >
            Daily Steps:{" "}
            <Text weight="bold" color="text">
              {recommendations.exercise.stepsPerDay}
            </Text>{" "}
            steps
          </Text>
        </View>
      </View>

      <Text variant="caption" color="secondary" style={styles.disclaimer}>
        These predictions are based on following the recommended diet and
        exercise plan consistently. Individual results may vary.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 8,
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  intensitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  intensityButtons: {
    flexDirection: "row",
  },
  intensityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: COLORS.surfaceAlt,
  },
  selectedIntensityButton: {
    backgroundColor: COLORS.primary,
  },
  predictionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  weightItem: {
    alignItems: "center",
  },
  milestonesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  milestoneCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  bodyCompositionContainer: {
    marginBottom: 24,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
  },
  bodyCompRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bodyCompItem: {
    alignItems: "center",
    flex: 1,
  },
  bodyCompDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bodyCompDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  calorieDeficitContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: SLATE.slate_200,
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationText: {
    marginLeft: 8,
  },
  disclaimer: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default GoalBasedWeightPrediction;
