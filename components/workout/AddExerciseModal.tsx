import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "@/styles/workout.styles";
import { calculateCaloriesBurned } from "@/utils/exerciseUtils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BaseModal, FormInput, SelectionPills, Text } from "@/components/ui";
import { findExactMatch, findFuzzyMatch } from "@/utils/searchUtils";

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
  const [loading, setLoading] = useState(false);

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

  const handleSelectExercise = (exercise: any) => {
    setExerciseName(exercise.name);
    setExerciseType(exercise.type);

    if (!exerciseDuration) {
      setExerciseDuration(exercise.duration.toString());
      setExerciseCalories(exercise.caloriesBurned.toString());
    } else {
      const duration = parseInt(exerciseDuration);
      if (!isNaN(duration)) {
        const calories = calculateCaloriesBurned(exercise.type, duration);
        setExerciseCalories(calories.toString());
      } else {
        setExerciseCalories(exercise.caloriesBurned.toString());
      }
    }
  };

  const handleExerciseNameChange = (text: string) => {
    setExerciseName(text);
    setIsSearching(text.trim().length >= 2);

    if (text.trim().length >= 3) {
      const autoDetectedType = determineExerciseType(text);
      setExerciseType(autoDetectedType);
    }

    if (matchingExercises && matchingExercises.length > 0) {
      // Try to find an exact match first
      const exactMatch = findExactMatch(matchingExercises, text, "name");

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

      // If no exact match, try fuzzy matching
      if (text.trim().length >= 2) {
        const fuzzyMatch = findFuzzyMatch(matchingExercises, text, "name");

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

  const handleAddCustomExercise = async () => {
    if (!userId || !exerciseName || !exerciseDuration) {
      alert("Please fill in all required fields");
      return;
    }

    let calories = exerciseCalories;
    if (!calories || calories === "") {
      const duration = parseInt(exerciseDuration);
      if (!isNaN(duration)) {
        calories = calculateCaloriesBurned(exerciseType, duration).toString();
        setExerciseCalories(calories);
      } else {
        alert("Please enter a valid duration");
        return;
      }
    }

    setLoading(true);
    try {
      await upsertExercise({
        userId,
        name: exerciseName,
        type: exerciseType,
        duration: parseInt(exerciseDuration),
        caloriesBurned: parseInt(calories),
        day: currentDay,
        date: currentDate,
        isCompleted: false,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert("Failed to add exercise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExerciseName("");
    setExerciseType("strength");
    setExerciseDuration("");
    setExerciseCalories("");
    setIsSearching(false);
  };

  const exerciseTypeOptions = [
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
    { value: "core", label: "Core" },
  ];

  const handleExerciseTypeChange = (type: string | null) => {
    if (type) {
      setExerciseType(type);
      if (exerciseDuration) {
        const duration = parseInt(exerciseDuration);
        if (!isNaN(duration)) {
          const calories = calculateCaloriesBurned(type, duration);
          setExerciseCalories(calories.toString());
        }
      }
    }
  };

  const handleDurationChange = (text: string) => {
    setExerciseDuration(text);
    if (text && exerciseType) {
      const duration = parseInt(text);
      if (!isNaN(duration)) {
        const calories = calculateCaloriesBurned(exerciseType, duration);
        setExerciseCalories(calories.toString());
      }
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Add Custom Exercise"
      primaryAction={{
        label: "Save",
        onPress: handleAddCustomExercise,
        loading: loading,
        disabled: !exerciseName || !exerciseDuration,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: () => {
          resetForm();
          onClose();
        },
      }}
    >
      <FormInput
        label="Exercise Name"
        value={exerciseName}
        onChangeText={handleExerciseNameChange}
        placeholder="e.g., Push-ups"
      />

      {exerciseName.trim().length >= 3 && (
        <Text variant="body2" color="secondary" style={styles.matchingText}>
          Exercise type auto-detected:{" "}
          {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}
        </Text>
      )}

      {exerciseName.trim().length >= 2 &&
        matchingExercises &&
        matchingExercises.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <Text variant="body2" color="secondary" style={{ marginBottom: 8 }}>
              {matchingExercises.length} matching exercise(s) found
            </Text>
            <ScrollView
              style={styles.searchResults}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {matchingExercises.slice(0, 5).map((exercise, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectExercise(exercise)}
                >
                  <Text variant="body2" weight="semibold">
                    {exercise.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {exercise.type.charAt(0).toUpperCase() +
                      exercise.type.slice(1)}{" "}
                    | {exercise.duration} mins | {exercise.caloriesBurned} cal
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      <SelectionPills
        label="Exercise Type"
        options={exerciseTypeOptions}
        selectedValue={exerciseType}
        onSelect={handleExerciseTypeChange}
      />

      <FormInput
        label="Duration (minutes)"
        value={exerciseDuration}
        onChangeText={handleDurationChange}
        keyboardType="numeric"
        placeholder="e.g., 30"
      />

      {exerciseCalories ? (
        <View style={styles.caloriesContainer}>
          <Text
            variant="body2"
            weight="bold"
            color="secondary"
            style={styles.caloriesLabel}
          >
            Calories Burned:
          </Text>
          <Text
            variant="body1"
            weight="semibold"
            color="primary"
            style={styles.caloriesValue}
          >
            {exerciseCalories}
          </Text>
        </View>
      ) : (
        <Text variant="body2" color="secondary" style={styles.caloriesHint}>
          Enter an exercise name to auto-populate calories
        </Text>
      )}
    </BaseModal>
  );
};

export default AddExerciseModal;
