import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
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
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <View style={styles.exerciseTypeTag}>
        <Text style={styles.exerciseTypeText}>{exercise.type}</Text>
      </View>
    </View>
    <View style={styles.exerciseDetails}>
      <View style={styles.detailItem}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.detailText}>{exercise.duration} mins</Text>
      </View>
      <View style={styles.detailItem}>
        <MaterialCommunityIcons name="fire" size={18} color={COLORS.error} />
        <Text style={styles.detailText}>
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
        />
        <Text style={styles.startButtonText}>Start</Text>
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
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ExerciseCard;
