import React, { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WorkoutResetTrackerProps {
  userId: Id<"users">;
  today: string;
}

const WorkoutResetTracker: React.FC<WorkoutResetTrackerProps> = ({
  userId,
  today,
}) => {
  const resetCompletedExercises = useMutation(
    api.exercise.resetCompletedExercises
  );
  useEffect(() => {
    const checkAndResetWorkouts = async () => {
      if (!userId) return;

      try {
        const storedDate = await AsyncStorage.getItem("lastWorkoutResetDate");
        const lastResetDate = storedDate || "";
        if (lastResetDate && lastResetDate !== today) {
          try {
            await resetCompletedExercises({
              userId,
              previousDate: lastResetDate,
              newDate: today,
            });
            await AsyncStorage.setItem("lastWorkoutResetDate", today);
            console.log("Workout exercises reset for new day");
          } catch (error) {
            console.error("Error resetting workouts:", error);
          }
        } else if (!lastResetDate) {
          await AsyncStorage.setItem("lastWorkoutResetDate", today);
          console.log("First workout reset date set");
        }
      } catch (error) {
        console.error("Error with AsyncStorage:", error);
      }
    };

    checkAndResetWorkouts();
  }, [userId, today, resetCompletedExercises]);
  return null;
};

export default WorkoutResetTracker;
