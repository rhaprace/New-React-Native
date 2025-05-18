/**
 * StepCounter Component
 *
 * This component displays a step counter that uses the device's accelerometer
 * to track steps.
 *
 * The component has been refactored to remove dependencies on Health Connect,
 * simplifying the implementation to use only the accelerometer for step counting.
 */

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Use our custom SimpleCircularProgress to avoid SVG issues
import SimpleCircularProgress from "./SimpleCircularProgress";
import { Text, Card, Button } from "@/components/ui";
import { COLORS, SLATE, SPACING } from "@/constants/theme";
import { useAccelerometerStepCounter } from "@/hooks/useAccelerometerStepCounter";
import { styles } from "@/styles/stepcounter.styles";

interface StepCounterProps {
  defaultGoal?: number;
}

const StepCounter: React.FC<StepCounterProps> = ({ defaultGoal = 10000 }) => {
  // Use the accelerometer-based step counter
  const hookResult = useAccelerometerStepCounter(defaultGoal);

  const {
    permissionStatus,
    todaySteps,
    goalSteps,
    progress,
    isExpoGo,
    canAskAgain,
    setGoalSteps,
    resetSteps,
    requestPermissions,
    openAppSettings,
    startStepSimulation,
  } = hookResult;

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(goalSteps.toString());

  // Update newGoal state when goalSteps changes
  React.useEffect(() => {
    setNewGoal(goalSteps.toString());
  }, [goalSteps]);

  // Request permissions when component mounts
  React.useEffect(() => {
    if (permissionStatus === "unknown" && Platform.OS === "android") {
      console.log("Requesting permissions on StepCounter mount");
      requestPermissions();
    }
  }, []);

  // Add a useEffect to log step count changes for debugging
  React.useEffect(() => {
    console.log("StepCounter component - todaySteps updated:", todaySteps);
  }, [todaySteps]);

  const handleSaveGoal = () => {
    const goal = parseInt(newGoal);
    if (!isNaN(goal) && goal > 0) {
      console.log("Saving new step goal:", goal);
      setGoalSteps(goal);

      // Show confirmation to user
      Alert.alert(
        "Goal Updated",
        `Your daily step goal has been set to ${goal.toLocaleString()} steps.`,
        [{ text: "OK" }]
      );
    } else {
      // Show error if invalid input
      Alert.alert(
        "Invalid Goal",
        "Please enter a valid number greater than 0.",
        [{ text: "OK" }]
      );
    }
    setIsEditingGoal(false);
  };

  // Render a simple permission prompt
  const renderPermissionPrompt = () => {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="footsteps" size={48} color={SLATE.slate_500} />
        <Text variant="h5" weight="semibold" style={styles.permissionTitle}>
          Step Tracking
        </Text>
        <Text style={styles.permissionText}>
          To track your steps, we need permission to access motion sensors.
        </Text>
        <Text style={[styles.permissionText, { marginBottom: SPACING.sm }]}>
          This helps track your daily activity and fitness progress accurately
          as you walk.
        </Text>

        {/* Show different buttons based on permission state */}
        {!canAskAgain ? (
          // If we can't ask for permission again, show settings button
          <Button variant="primary" size="md" onPress={openAppSettings}>
            Open Settings
          </Button>
        ) : (
          // If we can ask for permission, show request button
          <Button
            variant="primary"
            size="md"
            onPress={async () => {
              console.log("Requesting permissions for step tracking...");
              try {
                const granted = await requestPermissions();
                console.log("Permission request result:", granted);
              } catch (error) {
                console.error(
                  "Error in permission request button handler:",
                  error
                );
              }
            }}
          >
            Enable Step Tracking
          </Button>
        )}

        {isExpoGo && (
          <View style={{ marginTop: SPACING.md }}>
            <Text
              style={[
                styles.permissionText,
                { color: SLATE.slate_600, fontWeight: "500" },
              ]}
            >
              Expo Go Limitation
            </Text>
            <Text
              style={[
                styles.permissionText,
                { marginTop: SPACING.xs, color: SLATE.slate_600 },
              ]}
            >
              Step tracking may be limited in Expo Go. For full functionality,
              the app needs to be built as a standalone app.
            </Text>
            {canAskAgain && (
              <Button
                variant="outline"
                size="md"
                style={{ marginTop: SPACING.sm }}
                onPress={startStepSimulation}
              >
                Use Simulated Steps
              </Button>
            )}
          </View>
        )}
      </View>
    );
  };

  // Wrap the render method in a try-catch to prevent navigation errors
  try {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="footsteps" size={24} color={SLATE.slate_700} />
            <Text variant="h5" weight="semibold" style={styles.title}>
              Step Counter
            </Text>
          </View>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => setIsEditingGoal(true)}
          >
            <Text variant="caption" color="secondary">
              Goal: {goalSteps}
            </Text>
            <Ionicons
              name="create-outline"
              size={14}
              color={SLATE.slate_500}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* Show permission prompt if permission is not granted */}
        {(permissionStatus === "unknown" ||
          (permissionStatus === "denied" && !isExpoGo)) &&
        Platform.OS === "android" ? (
          renderPermissionPrompt()
        ) : (
          <View style={styles.content}>
            <SimpleCircularProgress
              value={progress > 100 ? 100 : progress}
              radius={70}
              progressValueColor={SLATE.slate_800}
              maxValue={100}
              title={"Steps"}
              titleColor={SLATE.slate_500}
              titleStyle={{ fontSize: 14, fontWeight: "500" }}
              activeStrokeColor={
                progress >= 100 ? COLORS.success : SLATE.slate_700
              }
              inActiveStrokeColor={SLATE.slate_200}
              valueSuffix="%"
            />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="h5" weight="bold" style={styles.statValue}>
                  {todaySteps}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.statLabel}
                >
                  Steps Today
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="h5" weight="bold" style={styles.statValue}>
                  {goalSteps}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.statLabel}
                >
                  Daily Goal
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="h5" weight="bold" style={styles.statValue}>
                  {Math.round(todaySteps * 0.04)}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.statLabel}
                >
                  Calories
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.goalMessage,
                progress >= 100
                  ? styles.goalMessageSuccess
                  : styles.goalMessagePending,
              ]}
            >
              <Text
                variant="body2"
                color={progress >= 100 ? "success" : "secondary"}
                weight="medium"
              >
                {progress >= 100
                  ? "🎉 You've reached your step goal for today!"
                  : `${Math.round(progress)}% of your daily step goal completed`}
              </Text>
            </View>

            {/* Simplified tracking status indicator */}
            <View style={styles.motionStatusContainer}>
              <View style={styles.motionStatusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    permissionStatus === "granted"
                      ? styles.statusDotActive
                      : styles.statusDotInactive,
                  ]}
                />
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.motionStatusText}
                >
                  {permissionStatus === "granted"
                    ? "Step tracking active"
                    : "Step tracking inactive"}
                </Text>
              </View>

              {permissionStatus !== "granted" && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text
                    variant="caption"
                    weight="medium"
                    style={styles.permissionButtonText}
                  >
                    Enable Tracking
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reset button - only show if there are steps to reset */}
            {todaySteps > 0 && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  Alert.alert(
                    "Reset Step Count",
                    "Are you sure you want to reset your step count for today?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Reset",
                        style: "destructive",
                        onPress: () => {
                          resetSteps();
                          Alert.alert(
                            "Steps Reset",
                            "Your step count has been reset for today."
                          );
                        },
                      },
                    ]
                  );
                }}
              >
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text
                  variant="caption"
                  weight="medium"
                  style={styles.resetButtonText}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Goal Edit Modal */}
        <Modal
          visible={isEditingGoal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditingGoal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text variant="h6" weight="semibold" style={styles.modalTitle}>
                Set Daily Step Goal
              </Text>

              <Text style={styles.modalDescription}>
                Enter your desired daily step goal. This will be used to track
                your progress.
              </Text>

              <TextInput
                style={styles.input}
                value={newGoal}
                onChangeText={setNewGoal}
                keyboardType="number-pad"
                placeholder="Enter step goal"
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleSaveGoal}
              />

              {/* Quick preset buttons */}
              <View style={styles.presetContainer}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.presetLabel}
                >
                  Quick presets:
                </Text>
                <View style={styles.presetButtons}>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setNewGoal("5000")}
                  >
                    <Text
                      variant="caption"
                      weight="medium"
                      style={styles.presetButtonText}
                    >
                      5,000
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setNewGoal("7500")}
                  >
                    <Text
                      variant="caption"
                      weight="medium"
                      style={styles.presetButtonText}
                    >
                      7,500
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setNewGoal("10000")}
                  >
                    <Text
                      variant="caption"
                      weight="medium"
                      style={styles.presetButtonText}
                    >
                      10,000
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, marginRight: 8 }}
                  onPress={() => setIsEditingGoal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={handleSaveGoal}
                >
                  Save
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Card>
    );
  } catch (error) {
    console.error("Error rendering StepCounter:", error);
    // Return a fallback UI if rendering fails
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="footsteps" size={24} color={SLATE.slate_700} />
            <Text variant="h5" weight="semibold" style={styles.title}>
              Step Counter
            </Text>
          </View>
        </View>
        <View style={{ padding: 16, alignItems: "center" }}>
          {" "}
          <Text
            variant="body2"
            color="secondary"
            style={{ textAlign: "center", marginBottom: 8 }}
          >
            Step tracking is currently unavailable.
          </Text>
          <Text
            variant="caption"
            color="tertiary"
            style={{ textAlign: "center" }}
          >
            We're working to resolve this issue. Please check back later.
          </Text>
        </View>
      </Card>
    );
  }
};

export default StepCounter;
