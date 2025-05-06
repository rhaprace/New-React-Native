import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";
import { Id } from "@/convex/_generated/dataModel";

interface ExerciseItemProps {
  exercise: {
    _id: Id<"exercise">;
    name: string;
    type: string;
    duration: number;
    caloriesBurned: number;
    date: string;
    isCompleted: boolean;
  };
  formatDate: (date: string) => string;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, formatDate }) => {
  // Get icon based on exercise type
  const getExerciseIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardio":
        return "run";
      case "strength":
        return "dumbbell";
      case "flexibility":
        return "yoga";
      case "core":
        return "stomach";
      default:
        return "dumbbell";
    }
  };

  // Get background color based on exercise type
  const getBackgroundColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "cardio":
        return COLORS.error;
      case "strength":
        return COLORS.primary;
      case "flexibility":
        return COLORS.success;
      default:
        return COLORS.secondary;
    }
  };

  return (
    <View key={exercise._id} style={styles.workoutItem}>
      <View
        style={[
          styles.workoutIconContainer,
          { backgroundColor: getBackgroundColor(exercise.type) },
        ]}
      >
        <MaterialCommunityIcons
          name={getExerciseIcon(exercise.type)}
          size={18}
          color={COLORS.textOnPrimary}
        />
      </View>
      <View style={styles.workoutContent}>
        <Text variant="body1" weight="semibold" style={styles.workoutName}>
          {exercise.name}
        </Text>
        <View style={styles.workoutDetails}>
          <Text variant="caption" color="secondary" style={styles.workoutDetail}>
            {exercise.duration} mins
          </Text>
          <Text variant="caption" color="secondary" style={styles.workoutDetail}>
            •
          </Text>
          <Text variant="caption" color="secondary" style={styles.workoutDetail}>
            {exercise.caloriesBurned} cal
          </Text>
          <Text variant="caption" color="secondary" style={styles.workoutDate}>
            {formatDate(exercise.date)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExerciseItem;
