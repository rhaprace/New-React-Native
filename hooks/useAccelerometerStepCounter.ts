import { useState, useEffect, useRef } from "react";
import { Alert, Platform, Linking } from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const STORAGE_KEY = "atle_step_data";

// Enhanced step detection configuration for maximum sensitivity
const SAMPLING_RATE = 5; // Accelerometer sampling rate (in ms) - ultra fast for real-time detection
const STEP_DELAY_MIN = 50; // Minimum time between steps (in ms) - optimized for faster walking (reduced for better sensitivity)
const STEP_DELAY_MAX = 2000; // Maximum time between steps (in ms) - for very slow walking
const PEAK_THRESHOLD_INITIAL = 0.8; // Initial threshold for peak detection - lowered for better sensitivity
const WINDOW_SIZE = 30; // Size of the sliding window for peak detection - increased for better pattern recognition
const GRAVITY = 9.81; // Earth's gravity in m/s²

const STRICT_STEP_THRESHOLD = 1.2; // Higher threshold for real steps
const STRICT_STEP_MIN_DELAY = 300; // ms, minimum time between steps
const STRICT_STEP_MAX_DELAY = 2000; // ms, max time between steps
const STRICT_VARIANCE_MIN = 0.05; // Minimum variance for walking
const STRICT_VARIANCE_MAX = 2.0; // Maximum variance for walking

const ANTI_CHEAT_STEP_THRESHOLD = 1.05; // Lower than super strict, but not too low
const ANTI_CHEAT_VARIANCE_MIN = 0.02;
const ANTI_CHEAT_VARIANCE_MAX = 3.0;
const ANTI_CHEAT_RHYTHM_STD = 350; // ms, allow more natural variation

const SIMPLE_STEP_THRESHOLD = 1.02;

interface StepData {
  date: string;
  steps: number;
  goal: number;
}

interface StepCounterResult {
  isAvailable: boolean;
  permissionStatus: "unknown" | "granted" | "denied";
  currentSteps: number;
  todaySteps: number;
  goalSteps: number;
  progress: number;
  historyData: StepData[];
  isExpoGo: boolean;
  canAskAgain: boolean;
  setGoalSteps: (goal: number) => void;
  resetSteps: () => void;
  setCurrentSteps: React.Dispatch<React.SetStateAction<number>>;
  updateTodaySteps: (steps: number) => void;
  requestPermissions: () => Promise<boolean>;
  openAppSettings: () => void;
  startStepSimulation: () => void;
  stopStepSimulation: () => void;
}

export const useAccelerometerStepCounter = (
  defaultGoal: number = 10000
): StepCounterResult => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true); // Accelerometer is available on most devices
  const [permissionStatus, setPermissionStatus] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [goalSteps, setGoalSteps] = useState<number>(defaultGoal);
  const [historyData, setHistoryData] = useState<StepData[]>([]);
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [simulationInterval, setSimulationInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  // Step detection state
  const accelerometerSubscription = useRef<{ remove: () => void } | null>(null);
  const lastStepTime = useRef<number>(0);
  const lastAcceleration = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const accelerationMagnitude = useRef<number[]>([]);
  const isStepDetectionActive = useRef<boolean>(false);

  // Advanced step detection state
  const accelerationWindow = useRef<
    Array<{ x: number; y: number; z: number; timestamp: number }>
  >([]);
  const peakThreshold = useRef<number>(PEAK_THRESHOLD_INITIAL);
  const valleyThreshold = useRef<number>(PEAK_THRESHOLD_INITIAL * 0.6);
  const stepFrequency = useRef<number[]>([]);
  const lastPeakTime = useRef<number>(0);
  const lastValleyTime = useRef<number>(0);
  const adaptiveStepDelay = useRef<number>(STEP_DELAY_MIN);
  const devicePosition = useRef<"unknown" | "pocket" | "hand" | "bag">(
    "unknown"
  );
  const calibrationData = useRef<{
    walkingPattern: number[];
    runningPattern: number[];
    calibrated: boolean;
  }>({
    walkingPattern: [],
    runningPattern: [],
    calibrated: false,
  });

  // Check if running in Expo Go (using a safer approach to avoid deprecated property)
  const isExpoGo =
    Constants.executionEnvironment === "storeClient" ? false : true;

  // Get today's date in YYYY-MM-DD format
  const getTodayString = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Load saved step data
  const loadStepData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData: StepData[] = JSON.parse(savedData);
        setHistoryData(parsedData);

        // Find today's data
        const todayString = getTodayString();
        const todayData = parsedData.find((item) => item.date === todayString);

        if (todayData) {
          setTodaySteps(todayData.steps);
          setCurrentSteps(todayData.steps);
          setGoalSteps(todayData.goal);
        } else {
          // Create today's entry if it doesn't exist
          const newData = [
            ...parsedData,
            { date: todayString, steps: 0, goal: goalSteps },
          ];
          setHistoryData(newData);
          saveStepData(newData);
        }
      } else {
        // Initialize with today's entry
        const initialData = [
          { date: getTodayString(), steps: 0, goal: goalSteps },
        ];
        setHistoryData(initialData);
        saveStepData(initialData);
      }
    } catch (error) {
      console.error("Error loading step data:", error);
    }
  };

  // Save step data to AsyncStorage
  const saveStepData = async (data: StepData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving step data:", error);
    }
  };

  // Update today's step count
  const updateTodaySteps = (steps: number) => {
    console.log(`updateTodaySteps called with steps: ${steps}`);

    const todayString = getTodayString();

    // Check if today's entry exists in history
    const todayExists = historyData.some((item) => item.date === todayString);

    let updatedHistory;
    if (todayExists) {
      // Update existing entry
      updatedHistory = historyData.map((item) =>
        item.date === todayString ? { ...item, steps: steps } : item
      );
    } else {
      // Create new entry for today
      updatedHistory = [
        ...historyData,
        { date: todayString, steps: steps, goal: goalSteps },
      ];
    }

    // Update state immediately - but don't update currentSteps here
    // This avoids a circular update that could reset the counter
    setTodaySteps(steps);
    setHistoryData(updatedHistory);

    // Save to AsyncStorage immediately
    try {
      saveStepData(updatedHistory);
    } catch (error) {
      console.error("Error saving step data:", error);
    }

    console.log(`Updated today's steps to ${steps}`);
  };

  // Set goal steps
  const handleSetGoalSteps = (goal: number) => {
    const todayString = getTodayString();
    const updatedHistory = historyData.map((item) =>
      item.date === todayString ? { ...item, goal: goal } : item
    );

    setGoalSteps(goal);
    setHistoryData(updatedHistory);
    saveStepData(updatedHistory);
  };

  // Reset steps for today
  const resetSteps = () => {
    updateTodaySteps(0);
    setCurrentSteps(0);
    lastStepTime.current = 0;
  };

  // Function to open app settings
  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  // Function to start step simulation
  const startStepSimulation = () => {
    // Clear any existing simulation
    stopStepSimulation();

    // Create a new simulation interval
    const interval = setInterval(() => {
      const stepIncrement = Math.floor(Math.random() * 5) + 1; // 1-5 steps
      setCurrentSteps((prev) => {
        const newSteps = prev + stepIncrement;
        updateTodaySteps(newSteps);
        console.log(
          `Added ${stepIncrement} simulated steps. Total: ${newSteps}`
        );
        return newSteps;
      });
    }, 3000); // Every 3 seconds

    setSimulationInterval(interval);
    setPermissionStatus("granted");

    // Show a message that simulation has started
    Alert.alert(
      "Simulation Started",
      "Step simulation is now running. Steps will be added automatically every few seconds."
    );
  };

  // Function to stop step simulation
  const stopStepSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      console.log("Step simulation stopped");
    }
  };

  // Get Android version
  const getAndroidVersion = (): number => {
    if (Platform.OS !== "android") return 0;
    return parseInt(Platform.Version.toString(), 10);
  };

  // Enhanced step detection algorithm with real-time processing and improved sensitivity
  const detectStep = (acceleration: { x: number; y: number; z: number }) => {
    const now = Date.now();

    // Add timestamp to acceleration data
    const timestampedAcceleration = {
      ...acceleration,
      timestamp: now,
    };

    // Update acceleration window with new data
    accelerationWindow.current.push(timestampedAcceleration);

    // Keep a sliding window of the most recent acceleration data
    if (accelerationWindow.current.length > WINDOW_SIZE) {
      accelerationWindow.current.shift();
    }

    // Calculate the magnitude of acceleration (total G-force)
    const magnitude = Math.sqrt(
      Math.pow(acceleration.x, 2) +
        Math.pow(acceleration.y, 2) +
        Math.pow(acceleration.z, 2)
    );

    // Store the magnitude for pattern detection
    accelerationMagnitude.current.push(magnitude);
    if (accelerationMagnitude.current.length > WINDOW_SIZE) {
      accelerationMagnitude.current.shift();
    }

    // Update last acceleration
    lastAcceleration.current = acceleration;

    // Detect device position if not already determined
    if (
      devicePosition.current === "unknown" &&
      accelerationWindow.current.length >= WINDOW_SIZE
    ) {
      detectDevicePosition();
    }

    // Adaptive threshold based on recent motion patterns
    const dynamicThreshold = calculateDynamicThreshold();

    // Lower the threshold slightly for better sensitivity
    const adjustedThreshold = dynamicThreshold * 0.9;

    // Check for a step using our enhanced peak detection algorithm
    // Pass the current magnitude directly for more accurate real-time detection
    const isStep = detectStepWithPeakAnalysis(
      magnitude,
      now,
      adjustedThreshold
    );

    if (isStep) {
      // Use functional state update to ensure we're using the latest state value
      // This is critical to avoid race conditions with state updates
      setCurrentSteps((prevSteps) => {
        const newSteps = prevSteps + 1;
        console.log(`Incrementing steps from ${prevSteps} to ${newSteps}`);

        // Update today's steps with the new count
        // We need to call this inside the callback to ensure we use the updated value
        updateTodaySteps(newSteps);

        // Store the time between steps for anti-cheating analysis
        const now = Date.now();
        if (lastStepTime.current > 0) {
          const stepInterval = now - lastStepTime.current;
          // Only store reasonable step intervals (between 0.3 and 2 seconds)
          if (stepInterval > 300 && stepInterval < 2000) {
            stepFrequency.current.push(stepInterval);
            // Keep only the last 10 intervals
            if (stepFrequency.current.length > 10) {
              stepFrequency.current.shift();
            }
          }
        }

        return newSteps;
      });

      // Log the step detection for debugging
      console.log(`Step detected! Current count in state: ${currentSteps}`);

      // Detailed logging is now handled in the detectStepWithPeakAnalysis function
      return true;
    }

    return false;
  };

  // Balanced anti-cheat step detection
  const detectStepWithPeakAnalysis = (
    magnitude: number,
    timestamp: number,
    threshold: number
  ): boolean => {
    // Original permissive logic
    if (accelerationMagnitude.current.length < 3) {
      // Allow step detection with less data
      if (
        magnitude > threshold * 1.2 &&
        timestamp - lastStepTime.current > STEP_DELAY_MIN
      ) {
        // Simple detection for initial steps
        lastStepTime.current = timestamp;
        return true;
      }
      return false;
    }

    const recentMagnitudes = accelerationMagnitude.current;
    const currentValue = magnitude;
    const avgMagnitude =
      recentMagnitudes.reduce((sum, val) => sum + val, 0) /
      recentMagnitudes.length;

    // Check if we have a significant peak compared to the average
    const isPeak =
      currentValue > avgMagnitude * 1.1 && currentValue > threshold * 0.7;

    // Check for significant movement (acceleration change)
    const prevMagnitude = recentMagnitudes[recentMagnitudes.length - 2] || 0;
    const magnitudeChange = Math.abs(currentValue - prevMagnitude);
    const hasSignificantMovement = magnitudeChange > threshold * 0.25;

    // Only count as a step if:
    // 1. We detected a peak or significant movement
    // 2. The magnitude is above our threshold
    // 3. Enough time has passed since the last step
    if (
      (isPeak || hasSignificantMovement) &&
      currentValue > threshold * 0.9 &&
      timestamp - lastStepTime.current > STEP_DELAY_MIN
    ) {
      lastStepTime.current = timestamp;
      return true;
    }

    return false;
  };

  // Calculate a dynamic threshold based on recent motion patterns
  const calculateDynamicThreshold = (): number => {
    if (accelerationMagnitude.current.length < WINDOW_SIZE / 2) {
      return PEAK_THRESHOLD_INITIAL;
    }

    // Calculate average and standard deviation of recent magnitudes
    const sum = accelerationMagnitude.current.reduce((a, b) => a + b, 0);
    const avg = sum / accelerationMagnitude.current.length;

    const squaredDiffs = accelerationMagnitude.current.map((val) =>
      Math.pow(val - avg, 2)
    );
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) /
      accelerationMagnitude.current.length;
    const stdDev = Math.sqrt(variance);

    // Adjust threshold based on the variability of the signal
    // Higher variability (more movement) = higher threshold to avoid false positives
    // Lower variability (less movement) = lower threshold to catch subtle steps
    const dynamicThreshold = avg + stdDev * 0.8;

    // Ensure threshold stays within reasonable bounds
    return Math.max(0.8, Math.min(dynamicThreshold, 2.5));
  };

  // Detect the position of the device based on acceleration patterns
  const detectDevicePosition = (): void => {
    if (accelerationWindow.current.length < WINDOW_SIZE) {
      return;
    }

    // Calculate average vertical (y) component
    const avgY =
      accelerationWindow.current.reduce((sum, acc) => sum + acc.y, 0) /
      accelerationWindow.current.length;

    // Calculate variability in different axes
    const varianceX = calculateVariance(
      accelerationWindow.current.map((acc) => acc.x)
    );
    const varianceY = calculateVariance(
      accelerationWindow.current.map((acc) => acc.y)
    );
    const varianceZ = calculateVariance(
      accelerationWindow.current.map((acc) => acc.z)
    );

    // Determine device position based on acceleration patterns
    if (
      Math.abs(avgY - GRAVITY) < 2.0 &&
      varianceY < varianceX &&
      varianceY < varianceZ
    ) {
      // Device is likely in hand (vertical orientation, y-axis aligned with gravity)
      devicePosition.current = "hand";
    } else if (varianceZ > varianceX && varianceZ > varianceY) {
      // Device is likely in pocket (z-axis has highest variability during walking)
      devicePosition.current = "pocket";
    } else {
      // Device is likely in a bag or other position
      devicePosition.current = "bag";
    }

    console.log(`Detected device position: ${devicePosition.current}`);
  };

  // Helper function to calculate variance
  const calculateVariance = (values: number[]): number => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  };

  // Enhanced walking pattern detection with stricter thresholds for anti-cheating
  const isWalkingPattern = (): boolean => {
    // Need enough data to analyze - require more data for better accuracy
    if (accelerationMagnitude.current.length < 5) return false;

    // Calculate average and standard deviation
    const sum = accelerationMagnitude.current.reduce((a, b) => a + b, 0);
    const avg = sum / accelerationMagnitude.current.length;

    const squaredDiffs = accelerationMagnitude.current.map((val) =>
      Math.pow(val - avg, 2)
    );
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) /
      accelerationMagnitude.current.length;
    const stdDev = Math.sqrt(variance);

    // Calculate normalized standard deviation (coefficient of variation)
    const normalizedStdDev = stdDev / avg;

    // Check for rhythmic pattern using autocorrelation - required for most cases
    const hasRhythmicPattern = checkForRhythmicPattern();

    // Adjust thresholds based on detected device position - with stricter values
    let minThreshold = 0.01; // Increased minimum threshold to prevent false positives
    let maxThreshold = 1.0; // Lower maximum threshold to be more strict

    if (devicePosition.current === "pocket") {
      minThreshold = 0.02;
      maxThreshold = 1.0;
    } else if (devicePosition.current === "hand") {
      minThreshold = 0.01;
      maxThreshold = 0.9;
    } else if (devicePosition.current === "bag") {
      minThreshold = 0.02;
      maxThreshold = 1.0;
    }

    // If we have a very strong signal (high normalized std dev),
    // we'll count it as walking even without a rhythmic pattern
    // Increased from 0.15 to 0.2 for stricter detection
    const hasStrongSignal = normalizedStdDev > 0.2;

    // Check for consistent movement in any direction
    const hasConsistentMovement = checkForConsistentMovement();

    // Walking typically has a moderate standard deviation and rhythmic pattern
    // Now requiring more conditions to be met for anti-cheating
    return (
      normalizedStdDev > minThreshold &&
      normalizedStdDev < maxThreshold &&
      // Require rhythmic pattern OR (strong signal AND consistent movement)
      (hasRhythmicPattern || (hasStrongSignal && hasConsistentMovement))
    );
  };

  // Helper function to check for consistent movement in any direction
  const checkForConsistentMovement = (): boolean => {
    if (accelerationWindow.current.length < 5) return false;

    // Check if there's consistent movement in any direction
    const xValues = accelerationWindow.current.map((acc) => acc.x);
    const yValues = accelerationWindow.current.map((acc) => acc.y);
    const zValues = accelerationWindow.current.map((acc) => acc.z);

    // Calculate variance in each direction
    const xVariance = calculateVariance(xValues);
    const yVariance = calculateVariance(yValues);
    const zVariance = calculateVariance(zValues);

    // If there's significant variance in any direction, consider it movement
    return xVariance > 0.1 || yVariance > 0.1 || zVariance > 0.1;
  };

  // Anti-cheating: Check for consistent step pattern that resembles natural walking
  const checkConsistentStepPattern = (): boolean => {
    // Need enough data to analyze
    if (stepFrequency.current.length < 3) return true;

    // Calculate the average and standard deviation of step frequencies
    const sum = stepFrequency.current.reduce((a, b) => a + b, 0);
    const avg = sum / stepFrequency.current.length;

    const squaredDiffs = stepFrequency.current.map((val) =>
      Math.pow(val - avg, 2)
    );
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) / stepFrequency.current.length;
    const stdDev = Math.sqrt(variance);

    // Calculate coefficient of variation (normalized standard deviation)
    const cv = stdDev / avg;

    // Natural walking has a relatively consistent cadence
    // If the variation is too high, it might be fake movement
    // If it's too low, it might be a machine or programmatic simulation
    return cv > 0.05 && cv < 0.4;
  };

  // Enhanced rhythmic pattern detection with multiple lag values - stricter for anti-cheating
  const checkForRhythmicPattern = (): boolean => {
    if (accelerationMagnitude.current.length < 10) {
      return false; // Not enough data, don't assume it's valid (anti-cheating)
    }

    // Calculate autocorrelation to detect periodicity
    const values = accelerationMagnitude.current;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const normalizedValues = values.map((v) => v - mean);

    // Check multiple lag values to detect different walking speeds
    // Lag=1: Fast walking, Lag=2: Normal walking, Lag=3: Slow walking
    const lagValues = [1, 2, 3];
    let maxAutocorrelation = 0;

    // Find the best autocorrelation across different lag values
    for (const lag of lagValues) {
      let autocorrelation = 0;
      for (let i = 0; i < normalizedValues.length - lag; i++) {
        autocorrelation += normalizedValues[i] * normalizedValues[i + lag];
      }

      // Normalize autocorrelation
      const variance = normalizedValues.reduce((a, b) => a + b * b, 0);
      const normalizedAutocorrelation =
        variance > 0 ? autocorrelation / variance : 0;

      // Keep track of the maximum autocorrelation
      maxAutocorrelation = Math.max(
        maxAutocorrelation,
        normalizedAutocorrelation
      );
    }

    // Increased threshold for positive autocorrelation to be more strict
    // This requires a stronger rhythmic pattern to be detected
    return maxAutocorrelation > 0.15; // Increased from 0.1 to 0.15 for anti-cheating
  };

  // Start the accelerometer and step detection with advanced algorithm
  const startStepDetection = async () => {
    // If already active, don't restart
    if (isStepDetectionActive.current) {
      console.log("Step detection already active, not restarting");
      return accelerometerSubscription.current;
    }

    try {
      // Clean up any existing subscription first to avoid duplicates
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
      }

      // Reset all step detection state
      lastStepTime.current = Date.now();
      lastPeakTime.current = 0;
      lastValleyTime.current = 0;
      accelerationMagnitude.current = [];
      accelerationWindow.current = [];
      lastAcceleration.current = { x: 0, y: 0, z: 0 };
      stepFrequency.current = [];
      adaptiveStepDelay.current = STEP_DELAY_MIN;
      devicePosition.current = "unknown";

      // Set up accelerometer with ultra-fast update interval for real-time detection
      console.log(
        `Setting accelerometer update interval to ${SAMPLING_RATE}ms`
      );
      Accelerometer.setUpdateInterval(SAMPLING_RATE);

      // Subscribe to accelerometer updates with improved error handling
      console.log(
        "Subscribing to accelerometer updates with advanced algorithm..."
      );
      const subscription = Accelerometer.addListener((acceleration) => {
        try {
          // Call detectStep - no need to store the result since we handle updates in the function
          detectStep(acceleration);

          // The detectStep function now handles the state updates properly
          // with functional updates to avoid race conditions
        } catch (error) {
          console.error("Error in step detection:", error);
        }
      });

      accelerometerSubscription.current = subscription;
      isStepDetectionActive.current = true;

      console.log("Advanced step detection started successfully");

      // Verify subscription is working by logging initial values
      setTimeout(() => {
        if (isStepDetectionActive.current) {
          console.log("Advanced step detection is active and running");

          // Log the current device position if detected
          if (devicePosition.current !== "unknown") {
            console.log(`Device position detected: ${devicePosition.current}`);
          }

          // Log the current adaptive threshold
          console.log(
            `Current step detection threshold: ${peakThreshold.current.toFixed(2)}`
          );
        } else {
          console.log("Step detection may not be running properly");
          // Try to restart if it doesn't seem to be working
          restartStepDetection();
        }
      }, 1500);

      return subscription;
    } catch (error) {
      console.error("Error starting accelerometer:", error);
      isStepDetectionActive.current = false;
      return null;
    }
  };

  // Helper function to restart step detection if it fails - with improved error handling
  const restartStepDetection = async () => {
    console.log("Attempting to restart advanced step detection...");

    // Clean up existing subscription
    if (accelerometerSubscription.current) {
      try {
        accelerometerSubscription.current.remove();
      } catch (removeError) {
        console.error(
          "Error removing subscription during restart:",
          removeError
        );
        // Continue anyway
      }
      accelerometerSubscription.current = null;
    }

    isStepDetectionActive.current = false;

    // Reset critical state variables
    lastStepTime.current = Date.now();
    accelerationMagnitude.current = [];
    accelerationWindow.current = [];

    // Wait a moment before restarting with a slightly longer delay
    setTimeout(async () => {
      try {
        // Try with a different sampling rate if previous attempt failed
        const adjustedSamplingRate = SAMPLING_RATE * 1.5;
        console.log(
          `Trying with adjusted sampling rate: ${adjustedSamplingRate}ms`
        );

        try {
          Accelerometer.setUpdateInterval(adjustedSamplingRate);
        } catch (intervalError) {
          console.error("Error setting adjusted sampling rate:", intervalError);
          // Continue with default interval
        }

        try {
          const subscription = await startStepDetection();
          if (subscription) {
            console.log("Successfully restarted advanced step detection");
          } else {
            console.log(
              "Failed to restart step detection, will try one more time"
            );

            // One final attempt with default settings
            setTimeout(async () => {
              try {
                Accelerometer.setUpdateInterval(SAMPLING_RATE);
                const finalAttempt = await startStepDetection();
                if (finalAttempt) {
                  console.log(
                    "Successfully restarted step detection on final attempt"
                  );
                } else {
                  console.log("All restart attempts failed");
                  // Fall back to simulation mode if all attempts fail
                  console.log("Falling back to step simulation mode");
                  startStepSimulation();
                }
              } catch (finalError) {
                console.error("Error in final restart attempt:", finalError);
                // Fall back to simulation as last resort
                startStepSimulation();
              }
            }, 1000);
          }
        } catch (startError) {
          console.error(
            "Error starting step detection during restart:",
            startError
          );
          // Try one more time with a longer delay
          setTimeout(async () => {
            try {
              const lastAttempt = await startStepDetection();
              if (!lastAttempt) {
                console.log("Final restart attempt failed, using simulation");
                startStepSimulation();
              }
            } catch (lastError) {
              console.error("Error in last restart attempt:", lastError);
              startStepSimulation();
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Error restarting step detection:", error);
        // Fall back to simulation mode if all else fails
        startStepSimulation();
      }
    }, 800);
  };

  // Stop step detection and clean up all resources - with improved error handling
  const stopStepDetection = () => {
    try {
      if (accelerometerSubscription.current) {
        try {
          accelerometerSubscription.current.remove();
        } catch (removeError) {
          console.error(
            "Error removing accelerometer subscription:",
            removeError
          );
          // Continue cleanup anyway
        }

        accelerometerSubscription.current = null;
        isStepDetectionActive.current = false;

        // Clear all data structures to free memory
        accelerationMagnitude.current = [];
        accelerationWindow.current = [];
        stepFrequency.current = [];

        // Save the current step count before stopping
        try {
          const todayString = getTodayString();
          const todayData = historyData.find(
            (item) => item.date === todayString
          );
          if (todayData) {
            console.log(
              `Saving current step count (${todayData.steps}) before stopping`
            );
          }
        } catch (saveError) {
          console.error("Error saving step count during cleanup:", saveError);
        }

        console.log("Advanced step detection stopped and resources cleaned up");
      }
    } catch (error) {
      console.error("Error stopping step detection:", error);
      // Reset critical references even if there was an error
      accelerometerSubscription.current = null;
      isStepDetectionActive.current = false;
    }
  };

  // Function to request permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Load saved data first
      await loadStepData();

      // For Android 10+ (API level 29+), we need ACTIVITY_RECOGNITION permission
      if (Platform.OS === "android" && getAndroidVersion() >= 29) {
        console.log("Requesting Android activity recognition permission");

        // Show permission explanation dialog first
        Alert.alert(
          "Step Tracking Permission",
          "To track your steps, AtleTech needs access to motion sensors. This helps track your fitness progress accurately.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                console.log("User cancelled permission request");
                setPermissionStatus("denied");
              },
            },
            {
              text: "Allow",
              onPress: async () => {
                try {
                  // Try to start the accelerometer which will trigger the system permission
                  setPermissionStatus("granted");
                  const subscription = await startStepDetection();

                  if (subscription) {
                    console.log("Accelerometer started successfully");
                  } else {
                    console.log("Failed to start accelerometer");
                    setPermissionStatus("denied");

                    // Show a message explaining the impact of the denial
                    Alert.alert(
                      "Permission Required",
                      "Step tracking requires access to motion sensors. Please enable it in app settings.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: openAppSettings },
                      ]
                    );
                  }
                } catch (error) {
                  console.error("Error in permission flow:", error);
                  setPermissionStatus("denied");

                  // Show a message explaining the impact of the denial
                  Alert.alert(
                    "Permission Required",
                    "Step tracking requires access to motion sensors. Please enable it in app settings.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Open Settings", onPress: openAppSettings },
                    ]
                  );
                }
              },
            },
          ],
          { cancelable: false }
        );

        // Return true to indicate we've handled the permission request flow
        // The actual permission will be processed in the alert callbacks
        return true;
      } else {
        // For iOS or older Android, we can just try to start the accelerometer directly
        setPermissionStatus("granted");
        const subscription = await startStepDetection();

        if (subscription) {
          console.log("Accelerometer started successfully");
          return true;
        } else {
          console.log("Failed to start accelerometer");
          setPermissionStatus("denied");
          return false;
        }
      }
    } catch (error) {
      console.error("Error in permission request:", error);
      setPermissionStatus("denied");
      return false;
    }
  };

  // Initialize step counter
  useEffect(() => {
    const initStepCounter = async () => {
      try {
        // Load saved data first
        await loadStepData();

        // Immediately request permissions on component mount
        if (Platform.OS === "android" && getAndroidVersion() >= 29) {
          console.log(
            "Auto-requesting Android activity recognition permission on mount"
          );
          requestPermissions();
        } else {
          // For iOS or older Android, try to start the accelerometer directly
          const subscription = await startStepDetection();
          if (subscription) {
            setPermissionStatus("granted");
            console.log("Step detection initialized on startup");
          } else {
            setPermissionStatus("unknown");
            console.log(
              "Step detection not initialized, waiting for user permission"
            );
          }
        }
      } catch (error) {
        console.error("Error initializing step counter:", error);
        setPermissionStatus("unknown");
      }
    };

    initStepCounter();

    // Cleanup on unmount
    return () => {
      stopStepDetection();
      stopStepSimulation();
    };
  }, []);

  // Add a useEffect to monitor step count changes
  useEffect(() => {
    console.log(
      `Step count changed in useAccelerometerStepCounter: ${currentSteps}`
    );
  }, [currentSteps]);

  // Add a useEffect to monitor todaySteps changes
  useEffect(() => {
    console.log(
      `Today's steps changed in useAccelerometerStepCounter: ${todaySteps}`
    );
  }, [todaySteps]);

  // Calculate progress percentage
  const progress = goalSteps > 0 ? (todaySteps / goalSteps) * 100 : 0;

  return {
    isAvailable,
    permissionStatus,
    currentSteps,
    todaySteps,
    goalSteps,
    progress,
    historyData,
    isExpoGo,
    canAskAgain,
    setGoalSteps: handleSetGoalSteps,
    resetSteps,
    setCurrentSteps,
    updateTodaySteps,
    requestPermissions,
    openAppSettings,
    startStepSimulation,
    stopStepSimulation,
  };
};
