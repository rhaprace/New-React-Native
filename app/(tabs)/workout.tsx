import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { COLORS } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatusBar } from "expo-status-bar";
import { styles } from "@/styles/workout.styles";
import {
  TodaysExercises,
  WeeklyPlan,
  WorkoutStats,
  WorkoutHistoryModal,
  WeightGoalSelector,
} from "@/components/workout";

import ExerciseActionModal from "@/components/workout/modals/ExerciseActionModal";

const WorkoutPlanner = () => {
  const { user } = useUser();
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date().getDay()];

  const [weightGoal, setWeightGoal] = useState<"loss" | "gain" | "maintain">(
    "maintain"
  );

  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const todaysExercises = useQuery(
    api.exercise.getExercisesByDate,
    convexUser?._id
      ? {
          userId: convexUser._id,
          date: today,
          includeCompleted: false,
        }
      : "skip"
  );
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const startDate = last7Days.toISOString().split("T")[0];

  const exerciseHistory = useQuery(
    api.recentWorkouts.getWorkoutHistoryByDateRange,
    convexUser?._id
      ? {
          userId: convexUser._id,
          startDate: startDate,
          endDate: today,
        }
      : "skip"
  );
  const totalCaloriesToday =
    todaysExercises?.reduce(
      (total, exercise) => total + exercise.caloriesBurned,
      0
    ) || 0;

  const totalMinutesToday =
    todaysExercises?.reduce(
      (total, exercise) => total + exercise.duration,
      0
    ) || 0;
  if (!convexUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  const onRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
      setRefreshing(false);
    }, 1500);
  };
  useEffect(() => {
    console.log("Refreshing exercises list with trigger:", refreshTrigger);
    if (refreshTrigger > 0) {
      console.log("Forcing refetch of exercises data");
    }
  }, [refreshTrigger]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Planner</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
      <WorkoutStats
        totalCalories={totalCaloriesToday}
        totalMinutes={totalMinutesToday}
        onViewHistory={() => setHistoryModalVisible(true)}
      />
      <TodaysExercises
        exercises={todaysExercises as any}
        userId={convexUser._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onAddExercise={() => {
          console.log("onAddExercise callback triggered");
          setRefreshTrigger((prev) => prev + 1);
          if (!addExerciseModalVisible) {
            console.log("Opening add exercise modal");
            setAddExerciseModalVisible(true);
          } else {
            console.log("Modal already open, just refreshing data");
          }
        }}
      />
      <WeightGoalSelector
        weightGoal={weightGoal}
        onSelectGoal={setWeightGoal}
      />
      <WeeklyPlan currentDay={dayOfWeek} weightGoal={weightGoal} />
      <ExerciseActionModal
        visible={addExerciseModalVisible}
        onClose={() => {
          setAddExerciseModalVisible(false);
          setRefreshTrigger((prev) => prev + 1);
        }}
        userId={convexUser._id}
        currentDay={dayOfWeek}
        currentDate={today}
        editMode={false}
      />
      <WorkoutHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        history={exerciseHistory}
      />
    </View>
  );
};

export default WorkoutPlanner;
