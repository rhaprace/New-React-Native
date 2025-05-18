import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/workout.styles";
import { Text } from "@/components/ui";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define a more flexible Exercise type that can handle both exercise and recentWorkouts IDs
type Exercise = {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  day: string;
  date: string;
  isCompleted: boolean;
  _id?: Id<"exercise"> | Id<"recentWorkouts">;
  source?: string; // To track which table the exercise came from
};

interface TodaysExercisesProps {
  exercises?: Exercise[];
  userId?: Id<"users">;
  onAddExercise: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const TodaysExercises: React.FC<TodaysExercisesProps> = ({
  exercises,
  userId,
  onAddExercise,
  refreshing = false,
  onRefresh,
}) => {
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [timer, setTimer] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState("00:00");

  const upsertExercise = useMutation(api.addOrUpdateExercise.upsertExercise);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer !== null && prevTimer > 0) {
            const newTime = prevTimer - 1;

            // Format time display
            const minutes = Math.floor(newTime / 60);
            const seconds = newTime % 60;
            setTimeDisplay(
              `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );

            return newTime;
          }
          return 0;
        });
      }, 1000);
    } else if (timer === 0) {
      // Timer finished
      setIsRunning(false);
      if (selectedExercise) {
        // Auto-complete the exercise when timer ends
        handleCompleteExercise(selectedExercise, true);
        alert(`Time's up! ${selectedExercise.name} completed.`);
        // Close the timer modal after completion
        setTimeout(() => {
          closeTimer();
          // Add an additional refresh after closing the timer
          if (onRefresh) {
            onRefresh();
          }
        }, 2000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer, selectedExercise]);

  const handleStartTimer = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    if (exercise.duration > 0) {
      setTimer(exercise.duration * 60);
      setTimeDisplay(
        `${Math.floor(exercise.duration).toString().padStart(2, "0")}:00`
      );
      setTimerModalVisible(true);
    } else {
      alert("No duration set for this exercise!");
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (selectedExercise) {
      setTimer(selectedExercise.duration * 60);
      setTimeDisplay(
        `${Math.floor(selectedExercise.duration).toString().padStart(2, "0")}:00`
      );
      setIsRunning(false);
    }
  };

  const closeTimer = () => {
    setIsRunning(false);
    setTimer(null);
    setSelectedExercise(null);
    setTimerModalVisible(false);
  };

  const handleCompleteExercise = async (
    exercise: Exercise,
    forceComplete = false
  ) => {
    if (!userId) return;

    try {
      // When an exercise is completed, mark it as completed in the recentWorkouts table
      // This will cause it to be filtered out from the Today's Exercises list
      await upsertExercise({
        userId,
        name: exercise.name,
        type: exercise.type,
        duration: exercise.duration,
        caloriesBurned: exercise.caloriesBurned,
        day: exercise.day,
        date: exercise.date,
        isCompleted: true, // Always mark as completed
      });

      // Add a longer delay to ensure the database has time to update
      setTimeout(() => {
        // Refresh the exercises list after completing an exercise
        if (onRefresh) {
          onRefresh();
        }
      }, 1000);
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert("Failed to update exercise. Please try again.");
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={22}
            color={COLORS.primary}
          />
          <Text variant="h5" weight="semibold">
            Today's Exercises
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
          <Text variant="body1" weight="semibold" color="onPrimary">
            Add Exercise
          </Text>
        </TouchableOpacity>
      </View>

      {exercises && exercises.length > 0 ? (
        <FlatList
          data={exercises}
          keyExtractor={(item) => {
            // Create a unique key that works for both exercise and recentWorkouts IDs
            if (item._id) {
              return item._id.toString();
            }
            // Fallback to a combination of name and date if no ID is available
            return `${item.name}-${item.date}-${Math.random().toString(36).substring(7)}`;
          }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            ) : undefined
          }
          style={{ maxHeight: 300 }} // Set a fixed height to make it scrollable
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text variant="body1" weight="semibold">
                  {item.name}
                </Text>
                <Text variant="caption" color="secondary">
                  {item.duration} mins • {item.caloriesBurned} cal
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={[
                    styles.timerButton,
                    item.isCompleted && styles.completedButton,
                  ]}
                  onPress={() => handleStartTimer(item)}
                >
                  <MaterialCommunityIcons
                    name={item.isCompleted ? "check" : "timer-outline"}
                    size={20}
                    color={
                      item.isCompleted ? COLORS.textOnPrimary : COLORS.primary
                    }
                  />
                  {!item.isCompleted && (
                    <Text variant="body2" weight="semibold" color="primary">
                      Start
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="body1" color="secondary">
            No exercises for today
          </Text>
          <Text variant="caption" color="tertiary">
            Add a custom exercise or select from weekly plan
          </Text>
        </View>
      )}

      {/* Timer Modal */}
      <Modal
        visible={timerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTimer}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text variant="h5" weight="semibold">
              {selectedExercise?.name || "Exercise"} Timer
            </Text>

            <View style={styles.timerDisplay}>
              <Text variant="h3" weight="bold" color="primary">
                {timeDisplay}
              </Text>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity
                style={styles.timerControlButton}
                onPress={toggleTimer}
              >
                <MaterialCommunityIcons
                  name={isRunning ? "pause" : "play"}
                  size={24}
                  color={COLORS.primary}
                />
                <Text variant="body2" weight="medium" color="primary">
                  {isRunning ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timerControlButton}
                onPress={resetTimer}
              >
                <MaterialCommunityIcons
                  name="restart"
                  size={24}
                  color={COLORS.secondary}
                />
                <Text variant="body2" weight="medium" color="secondary">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeTimer}>
              <Text variant="body1" weight="semibold" color="onPrimary">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TodaysExercises;
