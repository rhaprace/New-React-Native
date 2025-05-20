import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/[day].style";
import { Text } from "@/components/ui";

// Helper function to format time
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

type ExerciseTimerProps = {
  timer: number;
  onStop: () => void;
};

const ExerciseTimer = ({ timer, onStop }: ExerciseTimerProps) => (
  <View style={styles.timerContainer}>
    <Text style={styles.timerText}>Time Remaining: {formatTime(timer)}</Text>
    <TouchableOpacity style={styles.stopButton} onPress={onStop}>
      <MaterialCommunityIcons
        name="stop"
        size={24}
        color={COLORS.textOnPrimary}
      />
      <Text style={styles.stopButtonText}>Stop</Text>
    </TouchableOpacity>
  </View>
);

export default ExerciseTimer;
