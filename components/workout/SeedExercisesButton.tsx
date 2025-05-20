import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/workout.styles";

interface SeedExercisesButtonProps {
  userId: Id<"users">;
}

const SeedExercisesButton: React.FC<SeedExercisesButtonProps> = ({
  userId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSeedExercises = async () => {
    setLoading(true);
  };

  return (
    <TouchableOpacity
      style={[styles.seedButton, loading && { opacity: 0.7 }]}
      onPress={handleSeedExercises}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.seedButtonText}>Initialize Exercise Database</Text>
      )}
    </TouchableOpacity>
  );
};

export default SeedExercisesButton;
