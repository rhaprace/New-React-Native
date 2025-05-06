import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { styles } from "@/styles/workout.styles";
import { calculateCaloriesBurned } from "@/utils/exerciseUtils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { COLORS } from "@/constants/theme";

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  userId: Id<"users">;
  currentDay: string;
  currentDate: string;
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  onClose,
  userId,
  currentDay,
  currentDate,
}) => {
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseType, setExerciseType] = useState("strength");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const upsertExercise = useMutation(api.addOrUpdateExercise.upsertExercise);

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

    // The auto-population of exercise details will happen when a user selects
    // an exercise from the search results, not automatically during typing
  };

  const handleAddCustomExercise = async () => {
    if (!userId || !exerciseName || !exerciseDuration) {
      alert("Please fill in all required fields");
      return;
    }
    if (!exerciseCalories || exerciseCalories === "") {
      const duration = parseInt(exerciseDuration);
      if (!isNaN(duration)) {
        const calories = calculateCaloriesBurned(exerciseType, duration);
        setExerciseCalories(calories.toString());
      } else {
        alert("Please enter a valid duration");
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
        isCompleted: false,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert("Failed to add exercise. Please try again.");
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
          <Text style={styles.modalTitle}>Add Custom Exercise</Text>

          <TextInput
            style={[styles.input, { color: COLORS.textPrimary }]}
            placeholder="Exercise Name"
            placeholderTextColor={COLORS.textTertiary}
            value={exerciseName}
            onChangeText={handleExerciseNameChange}
          />

          {exerciseName.trim().length >= 3 && (
            <Text style={styles.matchingText}>
              Exercise type auto-detected:{" "}
              {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}
            </Text>
          )}

          {isSearching && exerciseName.trim().length >= 2 && (
            <View style={styles.searchResultsContainer}>
              {matchingExercises === undefined ? (
                <Text style={styles.matchingText}>Searching...</Text>
              ) : matchingExercises.length === 0 ? (
                <Text style={styles.matchingText}>
                  No matching exercises found
                </Text>
              ) : (
                <>
                  <Text style={styles.matchingText}>
                    {matchingExercises.length} matching exercise(s) found
                  </Text>
                  <FlatList
                    style={[styles.searchResults, { maxHeight: 200 }]}
                    data={matchingExercises.slice(0, 10)}
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
                          setExerciseCalories(
                            exercise.caloriesBurned.toString()
                          );
                        }}
                      >
                        <Text style={styles.searchResultItemName}>
                          {exercise.name}
                        </Text>
                        <Text style={styles.searchResultItemDetails}>
                          {exercise.type.charAt(0).toUpperCase() +
                            exercise.type.slice(1)}{" "}
                          | {exercise.duration} mins | {exercise.caloriesBurned}{" "}
                          cal
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>
          )}

          <View style={styles.typeSelector}>
            <Text style={styles.typeLabel}>Exercise Type:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddCustomExercise}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddExerciseModal;
