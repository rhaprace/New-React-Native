import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Text } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CalorieHistoryChart,
  ProgressHeader,
  LoadingState,
  GoalBasedWeightPrediction,
  StepCounter,
} from "@/components/progress";
import { styles } from "@/styles/progress.style";

const Progress = () => {
  const { user, isLoaded } = useUser();
  const [selectedWeightGoal, setSelectedWeightGoal] = useState<
    "loss" | "gain" | "maintain"
  >("maintain");

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const todayStr = today.toISOString().split("T")[0];
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const userId = convexUser?._id;
  const userProfile = convexUser?.profile;

  // Get meal history
  const mealHistory = useQuery(
    api.meal.getMealHistoryByDateRange,
    userId
      ? {
          userId,
          startDate: thirtyDaysAgoStr,
          endDate: todayStr,
        }
      : "skip"
  );

  // Get weight prediction - currently not used but will be needed for future features
  // const weightPrediction = useQuery(
  //   api.weightPrediction.getWeightPrediction,
  //   userId
  //     ? {
  //         userId,
  //         daysToPredict: 30, // Predict for the next 30 days
  //       }
  //     : "skip"
  // );

  if (!isLoaded || !convexUser) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ProgressHeader
        title="Progress Tracking"
        subtitle="Track your fitness and nutrition achievements"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <StepCounter defaultGoal={10000} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.chartCard}
        >
          <View style={styles.weightGoalSelector}>
            <Text
              variant="body2"
              weight="semibold"
              style={styles.weightGoalLabel}
            >
              Weight Goal:
            </Text>
            <View style={styles.weightGoalButtons}>
              <TouchableOpacity
                style={[
                  styles.weightGoalButton,
                  selectedWeightGoal === "loss" &&
                    styles.selectedWeightGoalButton,
                ]}
                onPress={() => setSelectedWeightGoal("loss")}
              >
                <MaterialCommunityIcons
                  name="trending-down"
                  size={16}
                  color={
                    selectedWeightGoal === "loss"
                      ? COLORS.textOnPrimary
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.weightGoalButtonText,
                    selectedWeightGoal === "loss" &&
                      styles.selectedWeightGoalButtonText,
                  ]}
                >
                  Loss
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.weightGoalButton,
                  selectedWeightGoal === "maintain" &&
                    styles.selectedWeightGoalButton,
                ]}
                onPress={() => setSelectedWeightGoal("maintain")}
              >
                <MaterialCommunityIcons
                  name="trending-neutral"
                  size={16}
                  color={
                    selectedWeightGoal === "maintain"
                      ? COLORS.textOnPrimary
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.weightGoalButtonText,
                    selectedWeightGoal === "maintain" &&
                      styles.selectedWeightGoalButtonText,
                  ]}
                >
                  Maintain
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.weightGoalButton,
                  selectedWeightGoal === "gain" &&
                    styles.selectedWeightGoalButton,
                ]}
                onPress={() => setSelectedWeightGoal("gain")}
              >
                <MaterialCommunityIcons
                  name="trending-up"
                  size={16}
                  color={
                    selectedWeightGoal === "gain"
                      ? COLORS.textOnPrimary
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.weightGoalButtonText,
                    selectedWeightGoal === "gain" &&
                      styles.selectedWeightGoalButtonText,
                  ]}
                >
                  Gain
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {userId && userProfile?.weight && (
            <GoalBasedWeightPrediction
              userId={userId}
              currentWeight={userProfile.weight}
              weightGoal={selectedWeightGoal}
            />
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.chartCard}
        >
          <CalorieHistoryChart
            mealHistory={mealHistory || []}
            dailyCalorieGoal={userProfile?.dailyCalories || 2000}
          />
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Weight Tracking Modal removed */}
    </View>
  );
};

export default Progress;
