import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CalorieGoalTrackerProps {
  userId: any;
  today: string;
  isCalorieGoalReached: boolean;
  isCalorieGoalExceeded: boolean;
  totalCalories: number;
  dailyCalories: number;
  setShowResetMessage: (show: boolean) => void;
}
const CalorieGoalTracker: React.FC<CalorieGoalTrackerProps> = ({
  userId,
  today,
  isCalorieGoalReached,
  isCalorieGoalExceeded,
  totalCalories,
  dailyCalories,
  setShowResetMessage,
}) => {
  const trackCalorieGoal = useMutation(
    api.calorieGoalTracking.trackCalorieGoal
  );
  const resetCalorieTracking = useMutation(
    api.calorieGoalTracking.resetCalorieTracking
  );
  const calorieTracking = useQuery(
    api.calorieGoalTracking.getCalorieGoalTrackingByDate,
    userId
      ? {
          userId,
          date: today,
        }
      : "skip"
  );
  useEffect(() => {
    if (!userId) return;

    const checkAndResetGoal = async () => {
      if (
        calorieTracking &&
        (calorieTracking.goalReached || calorieTracking.goalExceeded)
      ) {
        const trackingDate = calorieTracking.date;
        const currentDate = new Date().toISOString().split("T")[0];
        if (trackingDate !== currentDate) {
          await resetCalorieTracking({
            userId,
            date: currentDate,
          });
          setShowResetMessage(true);
          setTimeout(() => {
            setShowResetMessage(false);
          }, 5000);
        }
      }
    };

    checkAndResetGoal();
  }, [userId, calorieTracking, resetCalorieTracking, setShowResetMessage]);
  useEffect(() => {
    if (!userId) return;
    const shouldTrack =
      !calorieTracking ||
      calorieTracking.goalReached !== isCalorieGoalReached ||
      calorieTracking.goalExceeded !== isCalorieGoalExceeded ||
      calorieTracking.totalCalories !== totalCalories;

    if (shouldTrack) {
      trackCalorieGoal({
        userId,
        date: today,
        goalReached: isCalorieGoalReached,
        goalExceeded: isCalorieGoalExceeded,
        totalCalories,
        dailyCalorieGoal: dailyCalories,
      });
    }
  }, [
    userId,
    isCalorieGoalReached,
    isCalorieGoalExceeded,
    totalCalories,
    dailyCalories,
    today,
    trackCalorieGoal,
    calorieTracking,
  ]);
  return null;
};

export default CalorieGoalTracker;
