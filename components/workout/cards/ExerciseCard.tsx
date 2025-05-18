import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Text } from "@/components/ui";
import { styles } from "@/styles/[day].style";

export type Exercise = {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  videoUrl?: string;
  instructions?: string;
  day?: string;
  date?: string;
  isCompleted?: boolean;
  _id?: string;
};

type ExerciseCardProps = {
  exercise: Exercise;
  onStartTimer: (exercise: Exercise) => void;
  onViewExercise: (exercise: Exercise) => void;
};

const ExerciseCard = ({
  exercise,
  onStartTimer,
  onViewExercise,
}: ExerciseCardProps) => (
  <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeader}>
      {" "}
      <Text variant="h5" weight="semibold">
        {exercise.name}
      </Text>
      <View style={styles.exerciseTypeTag}>
        <Text variant="caption" color="secondary">
          {exercise.type}
        </Text>
      </View>
    </View>

    <View style={styles.exerciseDetails}>
      <View style={styles.detailItem}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={18}
          color={COLORS.primary}
        />{" "}
        <Text variant="body2" color="secondary">
          {exercise.duration} mins
        </Text>
      </View>
      <View style={styles.detailItem}>
        <MaterialCommunityIcons name="fire" size={18} color={COLORS.error} />
        <Text variant="body2" color="secondary">
          {exercise.caloriesBurned} calories
        </Text>
      </View>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onStartTimer(exercise)}
      >
        <MaterialCommunityIcons
          name="play"
          size={18}
          color={COLORS.textOnPrimary}
        />{" "}
        <Text variant="button" color="onPrimary">
          Start
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => onViewExercise(exercise)}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={18}
          color={COLORS.textOnSecondary}
        />
        <Text variant="button" color="onSecondary">
          View
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ExerciseCard;
