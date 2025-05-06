import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ExerciseItem from "../cards/ExerciseItem";
import LoadingState from "@/components/home/LoadingState";
import EmptyState from "@/components/home/EmptyState";
import SectionHeader from "@/components/home/SectionHeader";
import { formatRelativeDate } from "@/utils/dateUtils";

interface RecentWorkout {
  _id: Id<"recentWorkouts">;
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  day: string;
  date: string;
  lastUsed: string;
}

interface WorkoutsListProps {
  userId?: Id<"users">;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ userId }) => {
  const router = useRouter();
  const recentWorkouts = useQuery(
    api.recentWorkouts.getRecentWorkouts,
    userId ? { userId, limit: 5 } : "skip"
  );

  const renderContent = () => {
    if (recentWorkouts === undefined) {
      return <LoadingState />;
    }

    if (recentWorkouts.length === 0) {
      return <EmptyState />;
    }

    return recentWorkouts.map((workout) => (
      <ExerciseItem
        key={workout._id}
        exercise={{
          ...workout,
          _id: workout._id as unknown as Id<"exercise">,
          isCompleted: true,
        }}
        formatDate={formatRelativeDate}
      />
    ));
  };

  return (
    <View>
      <SectionHeader
        title="Recent Workouts"
        iconName="dumbbell"
        buttonText="ADD WORKOUT"
        onButtonPress={() => router.push("/workout")}
      />
      {renderContent()}
    </View>
  );
};

export default WorkoutsList;
