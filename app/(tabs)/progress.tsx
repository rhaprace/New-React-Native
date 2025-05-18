import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Text } from "@/components/ui";
import { COLORS, FONT, SPACING } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CalorieHistoryChart,
  ProgressHeader,
  LoadingState,
  GoalBasedWeightPrediction,
  StepCounter,
} from "@/components/progress";
import { styles as progressStyles } from "@/styles/progress.style";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";

const ProgressScreen = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedWeightGoal, setSelectedWeightGoal] = useState<
    "loss" | "gain" | "maintain"
  >("maintain");

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const todayStr = today.toISOString().split("T")[0];
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const userId = userData?._id;
  const userProfile = userData?.profile;

  const { isLoading, hasAccess } = useSubscriptionCheck();
  if (isLoading) {
    return (
      <View style={progressStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text variant="body1" color="secondary">
          Checking access...
        </Text>
      </View>
    );
  }
  if (!hasAccess) {
    return null;
  }
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

  if (!isLoaded || !userData) {
    return <LoadingState />;
  }

  return (
    <View style={progressStyles.container}>
      <StatusBar style="dark" />
      <ProgressHeader
        title="Progress Tracking"
        subtitle="Track your fitness and nutrition achievements"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={progressStyles.scrollContent}
        nestedScrollEnabled={true}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <StepCounter defaultGoal={10000} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={progressStyles.chartCard}
        >
          <View style={progressStyles.weightGoalSelector}>
            <Text
              variant="body2"
              weight="semibold"
              style={progressStyles.weightGoalLabel}
            >
              Weight Goal:
            </Text>
            <View style={progressStyles.weightGoalButtons}>
              <TouchableOpacity
                style={[
                  progressStyles.weightGoalButton,
                  selectedWeightGoal === "loss" &&
                    progressStyles.selectedWeightGoalButton,
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
                    progressStyles.weightGoalButtonText,
                    selectedWeightGoal === "loss" &&
                      progressStyles.selectedWeightGoalButtonText,
                  ]}
                >
                  Loss
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  progressStyles.weightGoalButton,
                  selectedWeightGoal === "maintain" &&
                    progressStyles.selectedWeightGoalButton,
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
                    progressStyles.weightGoalButtonText,
                    selectedWeightGoal === "maintain" &&
                      progressStyles.selectedWeightGoalButtonText,
                  ]}
                >
                  Maintain
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  progressStyles.weightGoalButton,
                  selectedWeightGoal === "gain" &&
                    progressStyles.selectedWeightGoalButton,
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
                    progressStyles.weightGoalButtonText,
                    selectedWeightGoal === "gain" &&
                      progressStyles.selectedWeightGoalButtonText,
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
          style={progressStyles.chartCard}
        >
          <CalorieHistoryChart
            mealHistory={mealHistory || []}
            dailyCalorieGoal={userProfile?.dailyCalories || 2000}
          />
        </Animated.View>

        <View style={progressStyles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT.size.md,
  },
});

export default ProgressScreen;
