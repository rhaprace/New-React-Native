import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/theme";
import { weeklyWorkouts } from "@/constants/workoutData";
import { ExerciseVideo } from "@/components/workout";

type Exercise = {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  instructions?: string;
  videoUrl?: string;
};

const DayWorkout = () => {
  const { day } = useLocalSearchParams();
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleStartTimer = (duration: number) => {
    if (duration > 0) {
      setSeconds(duration * 60);
      setIsRunning(true);
      setHasAlerted(false);
    } else {
      alert("No duration set for this exercise!");
    }
  };

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRunning && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(intervalId);
            setIsRunning(false);
            if (!hasAlerted) {
              setHasAlerted(true);
              alert("Time's up!");
            }
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, seconds, hasAlerted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const dayString = (day as string)?.toLowerCase() || "monday";
  const selectedDayWorkout = weeklyWorkouts.find(
    (workout) => workout.day.toLowerCase() === dayString
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {dayString.charAt(0).toUpperCase() + dayString.slice(1)}'s Workout
        </Text>
      </View>
      <FlatList
        data={selectedDayWorkout?.exercises || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDuration}>{item.duration} mins</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartTimer(item.duration)}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewExercise(item)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {isRunning && seconds > 0 && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Time Remaining: {formatTime(seconds)}
          </Text>
        </View>
      )}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedExercise?.name}</Text>
            <Text style={styles.modalInstructions}>
              {selectedExercise?.instructions || "No instructions available."}
            </Text>
            <ExerciseVideo videoUrl={selectedExercise?.videoUrl} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DayWorkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  exerciseCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  exerciseDuration: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  startButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  startButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  viewButton: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  viewButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  timerContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  timerText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  modalInstructions: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: "center",
  },
  videoPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  videoPlaceholderText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
