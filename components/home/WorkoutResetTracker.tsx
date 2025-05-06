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
  // Get the reset mutation
  const resetCompletedExercises = useMutation(
    api.exercise.resetCompletedExercises
  );

  // Check if we need to reset workouts
  useEffect(() => {
    const checkAndResetWorkouts = async () => {
      if (!userId) return;

      try {
        // Get the last reset date from AsyncStorage
        const storedDate = await AsyncStorage.getItem("lastWorkoutResetDate");
        const lastResetDate = storedDate || "";

        // If we haven't reset today, and we have a previous date
        if (lastResetDate && lastResetDate !== today) {
          try {
            // Reset completed exercises from the previous day
            await resetCompletedExercises({
              userId,
              previousDate: lastResetDate,
              newDate: today,
            });

            // Update the last reset date
            await AsyncStorage.setItem("lastWorkoutResetDate", today);
            console.log("Workout exercises reset for new day");
          } catch (error) {
            console.error("Error resetting workouts:", error);
          }
        } else if (!lastResetDate) {
          // If we've never reset before, set today as the last reset date
          await AsyncStorage.setItem("lastWorkoutResetDate", today);
          console.log("First workout reset date set");
        }
      } catch (error) {
        console.error("Error with AsyncStorage:", error);
      }
    };

    checkAndResetWorkouts();
  }, [userId, today, resetCompletedExercises]);

  // This component doesn't render anything
  return null;
};

export default WorkoutResetTracker;
