import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/workout.styles";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Alert } from "react-native";

type Exercise = {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  day: string;
  date: string;
  isCompleted: boolean;
  _id?: string;
};

interface TodaysExercisesProps {
  exercises: Exercise[] | undefined;
  userId: Id<"users">;
  onAddExercise: () => void;
}

const TodaysExercises: React.FC<TodaysExercisesProps> = ({
  exercises,
  userId,
  onAddExercise,
}) => {
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [timer, setTimer] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState("00:00");

  const upsertExercise = useMutation(api.addOrUpdateExercise.upsertExercise);
  const deleteExercise = useMutation(api.deleteExercise.deleteExercise);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

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
        }, 1000);
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

      // Notify parent to refresh the exercise list
      if (onAddExercise) {
        setTimeout(() => {
          onAddExercise();
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert("Failed to update exercise. Please try again.");
    }
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!exercise._id) return;

    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExercise({
                exerciseId: exercise._id as Id<"exercise">,
              });
              // No need for an alert here as it will block the UI flow
              console.log("Exercise deleted successfully");

              // Call onAddExercise to trigger a refresh in the parent component
              if (onAddExercise) {
                // We're not actually adding an exercise, but using this callback
                // to notify the parent that it should refresh the exercise list
                setTimeout(() => {
                  onAddExercise();
                }, 300);
              }
            } catch (error) {
              console.error("Error deleting exercise:", error);
              Alert.alert(
                "Error",
                "Failed to delete exercise. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Exercises</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {exercises && exercises.length > 0 ? (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item._id || ""}
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseDetails}>
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
                    <Text
                      style={{
                        marginLeft: 4,
                        color: COLORS.primary,
                        fontWeight: "600",
                      }}
                    >
                      Start
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExercise(item)}
                >
                  <AntDesign
                    name="delete"
                    size={20}
                    color={COLORS.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exercises for today</Text>
          <Text style={styles.emptySubtext}>
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
            <Text style={styles.modalTitle}>
              {selectedExercise?.name || "Exercise"} Timer
            </Text>

            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{timeDisplay}</Text>
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
                <Text style={styles.timerControlText}>
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
                <Text style={styles.timerControlText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeTimer}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TodaysExercises;
