import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "@/styles/workout.styles";
import { COLORS } from "@/constants/theme";
import { calculateCaloriesBurned } from "@/utils/exerciseUtils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ExerciseActionModalProps {
  visible: boolean;
  onClose: () => void;
  userId: Id<"users">;
  currentDay: string;
  currentDate: string;
  editMode?: boolean;
  exerciseToEdit?: {
    _id?: Id<"exercise"> | string;
    name: string;
    type: string;
    duration: number;
    caloriesBurned: number;
    day: string;
    date: string;
    isCompleted: boolean;
  };
}

const ExerciseActionModal: React.FC<ExerciseActionModalProps> = ({
  visible,
  onClose,
  userId,
  currentDay,
  currentDate,
  editMode = false,
  exerciseToEdit,
}) => {
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseType, setExerciseType] = useState("strength");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize form with exercise data if in edit mode
  useEffect(() => {
    if (editMode && exerciseToEdit) {
      // Extract name without category if it's in the format "Name (category)"
      let name = exerciseToEdit.name;
      const categoryMatch = name.match(/\((upper|lower|full|cardio)\)$/i);
      if (categoryMatch) {
        name = name.replace(/ \([^)]+\)$/, ""); // Remove the category part from the name
      }

      setExerciseName(name);
      setExerciseType(exerciseToEdit.type);
      setExerciseDuration(exerciseToEdit.duration.toString());
      setExerciseCalories(exerciseToEdit.caloriesBurned.toString());
    } else {
      resetForm();
    }
  }, [editMode, exerciseToEdit, visible]);

  // Mutations
  const upsertExercise = useMutation(api.addOrUpdateExercise.upsertExercise);
  const deleteExercise = useMutation(
    api.directDeleteExercise.deleteExerciseById
  );

  // Search in exercises database
  const matchingExercises = useQuery(
    api.exercise.searchExercisesByName,
    isSearching && exerciseName.trim().length >= 2
      ? {
          name: exerciseName,
          userId,
        }
      : "skip"
  );

  const determineExerciseType = (name: string): string => {
    const normalizedName = name.toLowerCase();
    if (
      normalizedName.includes("run") ||
      normalizedName.includes("jog") ||
      normalizedName.includes("sprint") ||
      normalizedName.includes("cardio") ||
      normalizedName.includes("cycling") ||
      normalizedName.includes("bike") ||
      normalizedName.includes("swim") ||
      normalizedName.includes("rowing") ||
      normalizedName.includes("elliptical") ||
      normalizedName.includes("jump") ||
      normalizedName.includes("burpee") ||
      normalizedName.includes("aerobic") ||
      normalizedName.includes("walking") ||
      normalizedName.includes("stair") ||
      normalizedName.includes("treadmill")
    ) {
      return "cardio";
    }
    if (
      normalizedName.includes("yoga") ||
      normalizedName.includes("stretch") ||
      normalizedName.includes("pilates") ||
      normalizedName.includes("mobility") ||
      normalizedName.includes("flex")
    ) {
      return "flexibility";
    }
    if (
      normalizedName.includes("ab") ||
      normalizedName.includes("core") ||
      normalizedName.includes("plank") ||
      normalizedName.includes("crunch") ||
      normalizedName.includes("sit-up") ||
      normalizedName.includes("situp") ||
      normalizedName.includes("twist") ||
      normalizedName.includes("leg raise")
    ) {
      return "core";
    }
    return "strength";
  };

  const handleExerciseNameChange = (text: string) => {
    setExerciseName(text);
    setIsSearching(text.trim().length >= 2);
    if (text.trim().length >= 3) {
      const autoDetectedType = determineExerciseType(text);
      setExerciseType(autoDetectedType);
    }

    if (matchingExercises && matchingExercises.length > 0) {
      const exactMatch = matchingExercises.find(
        (ex) => ex.name.toLowerCase() === text.toLowerCase()
      );

      if (exactMatch) {
        setExerciseType(exactMatch.type);

        if (!exerciseDuration) {
          setExerciseDuration(exactMatch.duration.toString());
          setExerciseCalories(exactMatch.caloriesBurned.toString());
        } else {
          const duration = parseInt(exerciseDuration);
          if (!isNaN(duration)) {
            const calories = calculateCaloriesBurned(exactMatch.type, duration);
            setExerciseCalories(calories.toString());
          } else {
            setExerciseCalories(exactMatch.caloriesBurned.toString());
          }
        }
        return;
      }

      const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (normalizedText.length >= 2) {
        const fuzzyMatch = matchingExercises.find((ex) => {
          const normalizedExName = ex.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          return (
            normalizedExName.includes(normalizedText) ||
            normalizedText.includes(normalizedExName)
          );
        });

        if (fuzzyMatch) {
          setExerciseType(fuzzyMatch.type);

          if (!exerciseDuration) {
            setExerciseDuration(fuzzyMatch.duration.toString());
            setExerciseCalories(fuzzyMatch.caloriesBurned.toString());
          } else {
            const duration = parseInt(exerciseDuration);
            if (!isNaN(duration)) {
              const calories = calculateCaloriesBurned(
                fuzzyMatch.type,
                duration
              );
              setExerciseCalories(calories.toString());
            } else {
              setExerciseCalories(fuzzyMatch.caloriesBurned.toString());
            }
          }
        }
      }
    }
  };

  const handleSaveExercise = async () => {
    if (!userId || !exerciseName || !exerciseDuration) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!exerciseCalories || exerciseCalories === "") {
      const duration = parseInt(exerciseDuration);
      if (!isNaN(duration)) {
        const calories = calculateCaloriesBurned(exerciseType, duration);
        setExerciseCalories(calories.toString());
      } else {
        Alert.alert("Error", "Please enter a valid duration");
        return;
      }
    }

    try {
      await upsertExercise({
        userId,
        name: exerciseName,
        type: exerciseType,
        duration: parseInt(exerciseDuration),
        caloriesBurned: parseInt(exerciseCalories),
        day: currentDay,
        date: currentDate,
        isCompleted:
          editMode && exerciseToEdit ? exerciseToEdit.isCompleted : false,
      });

      console.log("Exercise saved successfully:", {
        name: exerciseName,
        type: exerciseType,
        duration: parseInt(exerciseDuration),
        calories: parseInt(exerciseCalories),
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving exercise:", error);
      Alert.alert("Error", "Failed to save exercise. Please try again.");
    }
  };

  const handleDeleteExercise = async () => {
    if (!editMode || !exerciseToEdit || !exerciseToEdit._id) {
      console.error("Cannot delete: No exercise ID provided");
      return;
    }

    try {
      // Convert the ID to the correct type
      const exerciseId = exerciseToEdit._id as Id<"exercise">;

      // Call the delete mutation
      await deleteExercise({
        exerciseId,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error deleting exercise:", error);

      let errorMessage = "Failed to delete exercise. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const resetForm = () => {
    setExerciseName("");
    setExerciseType("strength");
    setExerciseDuration("");
    setExerciseCalories("");
    setIsSearching(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editMode ? "Edit Exercise" : "Add Exercise"}
          </Text>

          <TextInput
            style={[styles.input, { color: COLORS.textPrimary }]}
            placeholder="Exercise Name"
            placeholderTextColor={COLORS.textTertiary}
            value={exerciseName}
            onChangeText={handleExerciseNameChange}
          />

          {exerciseName.trim().length >= 3 && !editMode && (
            <Text style={styles.matchingText}>
              Exercise type auto-detected:{" "}
              {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}
            </Text>
          )}

          {matchingExercises && matchingExercises.length > 0 && !editMode && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.matchingText}>
                {matchingExercises.length} matching exercise(s) found
              </Text>
              <FlatList
                style={[styles.searchResults, { maxHeight: 200 }]}
                data={matchingExercises}
                keyExtractor={(_, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                renderItem={({ item: exercise }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      setExerciseName(exercise.name);
                      setExerciseType(exercise.type);
                      setExerciseDuration(exercise.duration.toString());
                      setExerciseCalories(exercise.caloriesBurned.toString());
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {exercise.name}
                    </Text>
                    <Text style={{ color: "#64748B", fontSize: 14 }}>
                      {exercise.type.charAt(0).toUpperCase() +
                        exercise.type.slice(1)}{" "}
                      | {exercise.duration} mins | {exercise.caloriesBurned} cal
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <View style={styles.typeSelector}>
            <Text style={styles.typeLabel}>Exercise Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["strength", "cardio", "flexibility", "core"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    exerciseType === type && styles.selectedTypeButton,
                  ]}
                  onPress={() => {
                    setExerciseType(type);
                    if (exerciseDuration) {
                      const duration = parseInt(exerciseDuration);
                      if (!isNaN(duration)) {
                        const calories = calculateCaloriesBurned(
                          type,
                          duration
                        );
                        setExerciseCalories(calories.toString());
                      }
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      exerciseType === type && styles.selectedTypeButtonText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={[styles.input, { color: COLORS.textPrimary }]}
            placeholder="Duration (minutes)"
            placeholderTextColor={COLORS.textTertiary}
            value={exerciseDuration}
            onChangeText={(text) => {
              setExerciseDuration(text);
              if (text && exerciseType) {
                const duration = parseInt(text);
                if (!isNaN(duration)) {
                  const calories = calculateCaloriesBurned(
                    exerciseType,
                    duration
                  );
                  setExerciseCalories(calories.toString());
                }
              }
            }}
            keyboardType="numeric"
          />

          {exerciseCalories ? (
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesLabel}>Calories Burned:</Text>
              <Text style={styles.caloriesValue}>{exerciseCalories}</Text>
            </View>
          ) : (
            <Text style={styles.caloriesHint}>
              Enter an exercise name to auto-populate calories
            </Text>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {editMode && exerciseToEdit && exerciseToEdit._id && (
              <TouchableOpacity
                style={[styles.modalDeleteButton, { marginHorizontal: 8 }]}
                onPress={() => {
                  Alert.alert(
                    "Delete Exercise",
                    `Are you sure you want to delete "${exerciseToEdit.name}"?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: handleDeleteExercise,
                      },
                    ]
                  );
                }}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color={COLORS.textOnPrimary}
                />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveExercise}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseActionModal;
