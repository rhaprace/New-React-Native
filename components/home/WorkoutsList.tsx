import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Import components
import ExerciseItem from "./ExerciseItem";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import SectionHeader from "./SectionHeader";

// Import utilities
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

  // Get recent workouts from Convex
  const recentWorkouts = useQuery(
    api.recentWorkouts.getRecentWorkouts,
    userId ? { userId, limit: 5 } : "skip"
  );

  // Render workout list content based on data state
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
          _id: workout._id as unknown as Id<"exercise">, // Type cast for compatibility
          isCompleted: true, // Always show as completed since it's a recent workout
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
