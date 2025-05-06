import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TestDeleteProps {
  exerciseId: Id<"exercise"> | string;
}

export const TestDeleteButton: React.FC<TestDeleteProps> = ({ exerciseId }) => {
  const deleteExercise = useMutation(api.deleteExercise.deleteExercise);
  const directDeleteExercise = useMutation(
    api.directDeleteExercise.deleteExerciseById
  );

  const handleTestDelete = async () => {
    try {
      console.log(
        "Test Delete - Attempting to delete exercise with ID:",
        exerciseId
      );

      // Convert the ID to the correct type if needed
      const typedExerciseId = exerciseId as Id<"exercise">;

      // Try the direct implementation first
      const result = await directDeleteExercise({
        exerciseId: typedExerciseId,
      });

      console.log("Test Delete - Result:", result);
      Alert.alert(
        "Success",
        "Exercise deleted successfully via direct test function"
      );
    } catch (error) {
      console.error("Test Delete - Error:", error);

      let errorMessage = "Failed to delete exercise. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const handleOriginalDelete = async () => {
    try {
      console.log(
        "Original Delete - Attempting to delete exercise with ID:",
        exerciseId
      );

      // Convert the ID to the correct type if needed
      const typedExerciseId = exerciseId as Id<"exercise">;

      // Try the original implementation
      const result = await deleteExercise({
        exerciseId: typedExerciseId,
      });

      console.log("Original Delete - Result:", result);
      Alert.alert(
        "Success",
        "Exercise deleted successfully via original function"
      );
    } catch (error) {
      console.error("Original Delete - Error:", error);

      let errorMessage = "Failed to delete exercise. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={{ marginTop: 10, gap: 5 }}>
      <Button
        title="Test Direct Delete"
        onPress={handleTestDelete}
        color="red"
      />
      <Button
        title="Test Original Delete"
        onPress={handleOriginalDelete}
        color="orange"
      />
    </View>
  );
};
