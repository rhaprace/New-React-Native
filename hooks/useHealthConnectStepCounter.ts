import { useState, useEffect, useRef } from "react";
import { Platform, Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccelerometerStepCounter } from "./useAccelerometerStepCounter";
import { healthConnectSafety } from "@/utils";

// Apply safety measures to prevent crashes
healthConnectSafety.preventHealthConnectCrashes();

// Safe imports for Health Connect
let healthConnect: any = null;
let initialize: any = () => {
  console.error("Health Connect initialize function not available");
  return Promise.resolve(false);
};
let requestPermission: any = () => {
  console.error("Health Connect requestPermission function not available");
  return Promise.resolve([]);
};
let readRecords: any = () => {
  console.error("Health Connect readRecords function not available");
  return Promise.resolve({ records: [] });
};
let getSdkStatus: any = () => {
  console.error("Health Connect getSdkStatus function not available");
  return Promise.resolve(0);
};
let openHealthConnectSettings: any = () => {
  console.error(
    "Health Connect openHealthConnectSettings function not available"
  );
};

// Try to import Health Connect functions safely
try {
  if (Platform.OS === "android") {
    healthConnect = require("react-native-health-connect");
    if (healthConnect) {
      initialize = healthConnect.initialize || initialize;
      requestPermission = healthConnect.requestPermission || requestPermission;
      readRecords = healthConnect.readRecords || readRecords;
      getSdkStatus = healthConnect.getSdkStatus || getSdkStatus;
      openHealthConnectSettings =
        healthConnect.openHealthConnectSettings || openHealthConnectSettings;
      console.log("Health Connect module imported successfully");
    }
  }
} catch (error) {
  console.error("Error importing Health Connect module:", error);
  // Continue with fallback functions
}

// Define types
export interface StepData {
  date: string;
  steps: number;
}

export interface StepCounterResult {
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
  setCurrentSteps: (steps: number) => void;
  updateTodaySteps: (steps: number) => void;
  requestPermissions: () => Promise<boolean>;
  openAppSettings: () => void;
  startStepSimulation: () => void;
  stopStepSimulation: () => void;
}

// Constants
const STEP_GOAL_KEY = "health_connect_step_goal";
const STEP_HISTORY_KEY = "health_connect_step_history";
const DEFAULT_GOAL = 10000;
const HEALTH_CONNECT_AVAILABILITY_KEY = "health_connect_available";

export const useHealthConnectStepCounter = (
  defaultGoal: number = DEFAULT_GOAL
): StepCounterResult => {
  // Use accelerometer step counter as fallback
  const accelerometerStepCounter = useAccelerometerStepCounter(defaultGoal);

  // State variables
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] =
    useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [goalSteps, setGoalSteps] = useState<number>(defaultGoal);
  const [historyData, setHistoryData] = useState<StepData[]>([]);
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [simulationInterval, setSimulationInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  // Refs
  const isInitialized = useRef<boolean>(false);
  const lastFetchTime = useRef<number>(0);
  const fetchInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper function to get today's date string
  const getTodayString = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  // Load saved step goal and history
  const loadStepData = async () => {
    try {
      // Load step goal
      const savedGoal = await AsyncStorage.getItem(STEP_GOAL_KEY);
      if (savedGoal) {
        const parsedGoal = parseInt(savedGoal);
        if (!isNaN(parsedGoal) && parsedGoal > 0) {
          setGoalSteps(parsedGoal);
          console.log("Loaded saved step goal:", parsedGoal);
        }
      }

      // Load step history
      const savedHistory = await AsyncStorage.getItem(STEP_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as StepData[];
        setHistoryData(parsedHistory);
        console.log("Loaded step history:", parsedHistory.length, "days");

        // Check if we have data for today
        const todayString = getTodayString();
        const todayData = parsedHistory.find(
          (item) => item.date === todayString
        );
        if (todayData) {
          setTodaySteps(todayData.steps);
          setCurrentSteps(todayData.steps);
          console.log("Loaded today's steps from history:", todayData.steps);
        }
      }

      // Check if Health Connect was previously available
      const healthConnectAvailable = await AsyncStorage.getItem(
        HEALTH_CONNECT_AVAILABILITY_KEY
      );
      if (healthConnectAvailable === "true") {
        console.log("Health Connect was previously available");
        setIsHealthConnectAvailable(true);
      }
    } catch (error) {
      console.error("Error loading step data:", error);
    }
  };

  // Save step goal
  const saveStepGoal = async (goal: number) => {
    try {
      await AsyncStorage.setItem(STEP_GOAL_KEY, goal.toString());
      console.log("Saved step goal:", goal);
    } catch (error) {
      console.error("Error saving step goal:", error);
    }
  };

  // Save step history
  const saveStepHistory = async (data: StepData[]) => {
    try {
      await AsyncStorage.setItem(STEP_HISTORY_KEY, JSON.stringify(data));
      console.log("Saved step history:", data.length, "days");
    } catch (error) {
      console.error("Error saving step history:", error);
    }
  };

  // Update today's steps
  const updateTodaySteps = (steps: number) => {
    // Update state immediately
    setTodaySteps(steps);

    // Update history data
    const todayString = getTodayString();

    // Check if today's entry exists in history
    const todayIndex = historyData.findIndex(
      (item) => item.date === todayString
    );

    let updatedHistory;
    if (todayIndex >= 0) {
      // Update existing entry
      updatedHistory = [...historyData];
      updatedHistory[todayIndex] = { ...updatedHistory[todayIndex], steps };
    } else {
      // Create new entry for today
      updatedHistory = [...historyData, { date: todayString, steps }];
    }

    // Update state and save to storage
    setHistoryData(updatedHistory);
    saveStepHistory(updatedHistory);

    console.log(`Health Connect: Updated today's steps to ${steps}`);
  };

  // Handle setting goal steps
  const handleSetGoalSteps = (goal: number) => {
    setGoalSteps(goal);
    saveStepGoal(goal);
  };

  // Reset steps for today
  const resetSteps = () => {
    setCurrentSteps(0);
    updateTodaySteps(0);
  };

  // Check if Health Connect is available on the device
  const checkHealthConnectAvailability = async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      console.log("Health Connect is only available on Android");
      return false;
    }

    try {
      // Check if Health Connect is available using getSdkStatus
      const status = await getSdkStatus();
      // getSdkStatus returns a number, not a string
      // We consider it available if it's installed (any non-zero value)
      const isAvailable = status !== 0;
      console.log(
        "Health Connect availability check result:",
        isAvailable,
        "status:",
        status
      );

      try {
        // Save availability status for future reference
        await AsyncStorage.setItem(
          HEALTH_CONNECT_AVAILABILITY_KEY,
          isAvailable ? "true" : "false"
        );
      } catch (storageError) {
        console.error(
          "Error saving Health Connect availability:",
          storageError
        );
        // Continue even if storage fails
      }

      return isAvailable;
    } catch (error) {
      console.error("Error checking Health Connect availability:", error);
      console.log("Falling back to accelerometer for step tracking");
      return false;
    }
  };

  // Initialize Health Connect
  const initHealthConnect = async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      console.log("Health Connect is only available on Android");
      return false;
    }

    try {
      // CRITICAL FIX: Add safety check for checkHealthConnectAvailability function
      if (typeof checkHealthConnectAvailability !== "function") {
        console.error(
          "Health Connect availability check function is not available"
        );
        return false;
      }

      // Check if Health Connect is available
      const isAvailable = await checkHealthConnectAvailability();
      setIsHealthConnectAvailable(isAvailable);

      if (!isAvailable) {
        console.log("Health Connect is not available on this device");
        return false;
      }

      // CRITICAL FIX: Add safety check for initialize function
      if (typeof initialize !== "function") {
        console.error("Health Connect initialize function is not available");
        return false;
      }

      // Initialize Health Connect
      const initResult = await initialize();
      if (!initResult) {
        console.log("Failed to initialize Health Connect");
        return false;
      }

      try {
        // CRITICAL FIX: Add safety check for requestPermission function
        if (typeof requestPermission !== "function") {
          console.error(
            "Health Connect requestPermission function is not available"
          );
          return false;
        }

        // Request permissions
        console.log("Requesting Health Connect permissions...");
        const grantedPermissions = await requestPermission([
          { accessType: "read", recordType: "Steps" },
          { accessType: "read", recordType: "Distance" },
        ]);

        console.log("Health Connect permissions result:", grantedPermissions);

        // Check if we got permissions
        if (grantedPermissions && grantedPermissions.length > 0) {
          console.log("Health Connect permissions granted");
          setPermissionStatus("granted");
          setCanAskAgain(true);
          // Set the ref to indicate initialization is complete
          isInitialized.current = true;

          try {
            // CRITICAL FIX: Add safety check for fetchStepData function
            if (typeof fetchStepData !== "function") {
              console.error("fetchStepData function is not available");
              return true; // Still return true as permissions were granted
            }

            // Start fetching step data
            await fetchStepData();

            // CRITICAL FIX: Add safety check for startStepDataFetching function
            if (typeof startStepDataFetching === "function") {
              startStepDataFetching();
            } else {
              console.error("startStepDataFetching function is not available");
            }
          } catch (fetchError) {
            console.error("Error fetching initial step data:", fetchError);
            // Continue even if initial fetch fails
          }

          return true;
        } else {
          console.log("Health Connect permissions denied");
          setPermissionStatus("denied");
          setCanAskAgain(true); // Default to true
          return false;
        }
      } catch (permissionError) {
        console.error(
          "Error requesting Health Connect permissions:",
          permissionError
        );
        return false;
      }
    } catch (error) {
      console.error("Error initializing Health Connect:", error);
      setIsHealthConnectAvailable(false);
      setPermissionStatus("unknown");
      return false;
    }
  };

  // Fetch step data from Health Connect
  const fetchStepData = async () => {
    if (!isInitialized.current) {
      console.log("Health Connect not initialized, skipping fetch");
      return;
    }

    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      console.log("Fetching step data from Health Connect...");
      console.log(
        "Time range:",
        startOfDay.toISOString(),
        "to",
        endOfDay.toISOString()
      );

      try {
        // CRITICAL FIX: Add safety check for readRecords function
        if (typeof readRecords !== "function") {
          console.error("Health Connect readRecords function is not available");
          return;
        }

        // Create time range filter
        const timeRangeFilter = {
          operator: "between" as const,
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        };

        // Get step count for today
        const stepsData = await readRecords("Steps", { timeRangeFilter });
        console.log("Steps data received from Health Connect:", stepsData);

        // Calculate total steps
        let totalSteps = 0;
        if (stepsData && Array.isArray(stepsData.records)) {
          totalSteps = stepsData.records.reduce(
            (sum: number, current: any) => sum + (current.count || 0),
            0
          );
        }
        console.log("Total steps from Health Connect:", totalSteps);

        if (totalSteps >= 0) {
          setCurrentSteps(totalSteps);

          // CRITICAL FIX: Add safety check for updateTodaySteps function
          if (typeof updateTodaySteps === "function") {
            updateTodaySteps(totalSteps);
          } else {
            console.error("updateTodaySteps function is not available");
          }

          lastFetchTime.current = Date.now();
        }
      } catch (stepCountError) {
        console.error(
          "Error getting step count from Health Connect:",
          stepCountError
        );
      }
    } catch (error) {
      console.error("Error fetching step data from Health Connect:", error);
    }
  };

  // Start periodic fetching of step data
  const startStepDataFetching = () => {
    // Clear any existing interval
    if (fetchInterval.current) {
      clearInterval(fetchInterval.current);
    }

    // Set up new interval to fetch step data every minute
    fetchInterval.current = setInterval(() => {
      fetchStepData();
    }, 60000); // Every minute
  };

  // Request permissions for step tracking
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      console.log("Health Connect is only available on Android");
      // Fall back to accelerometer
      setIsUsingFallback(true);
      return accelerometerStepCounter.requestPermissions();
    }

    try {
      // CRITICAL FIX: Add safety check for Health Connect module
      if (typeof getSdkStatus !== "function") {
        console.error("Health Connect module is not properly initialized");
        // Fall back to accelerometer
        setIsUsingFallback(true);
        return accelerometerStepCounter.requestPermissions();
      }

      // Check if Health Connect is available
      const status = await getSdkStatus();
      // getSdkStatus returns a number, not a string
      const isAvailable = status !== 0;
      setIsHealthConnectAvailable(isAvailable);

      if (!isAvailable) {
        console.log(
          "Health Connect is not available, showing installation prompt"
        );

        // Prompt user to install Health Connect if not available
        Alert.alert(
          "Health Connect Required",
          "To track your steps accurately, please install the Health Connect app from Google Play Store.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Install",
              onPress: () => {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
                );
              },
            },
          ]
        );

        // Fall back to accelerometer
        setIsUsingFallback(true);
        return accelerometerStepCounter.requestPermissions();
      }

      // CRITICAL FIX: Add safety check for initHealthConnect function
      if (typeof initHealthConnect !== "function") {
        console.error(
          "Health Connect initialization function is not available"
        );
        // Fall back to accelerometer
        setIsUsingFallback(true);
        return accelerometerStepCounter.requestPermissions();
      }

      // Try to initialize Health Connect
      const result = await initHealthConnect();

      if (!result) {
        console.log(
          "Health Connect initialization failed, falling back to accelerometer"
        );
        setIsUsingFallback(true);
        return accelerometerStepCounter.requestPermissions();
      }

      return result;
    } catch (error) {
      console.error("Error requesting Health Connect permissions:", error);
      // Fall back to accelerometer
      setIsUsingFallback(true);
      return accelerometerStepCounter.requestPermissions();
    }
  };

  // Open app settings
  const openAppSettings = () => {
    if (isUsingFallback) {
      return accelerometerStepCounter.openAppSettings();
    }

    // For Health Connect, we'll try to open Health Connect settings
    try {
      if (Platform.OS === "android") {
        // CRITICAL FIX: Add safety check for openHealthConnectSettings function
        if (typeof openHealthConnectSettings === "function") {
          openHealthConnectSettings();
        } else {
          console.error("Health Connect settings function is not available");
          // Fall back to accelerometer settings
          accelerometerStepCounter.openAppSettings();
        }
      }
    } catch (error) {
      console.error("Error opening settings:", error);
      // Fall back to accelerometer settings on error
      try {
        accelerometerStepCounter.openAppSettings();
      } catch (fallbackError) {
        console.error("Error opening fallback settings:", fallbackError);
      }
    }
  };

  // Start step simulation for testing
  const startStepSimulation = () => {
    // Clear any existing simulation
    stopStepSimulation();

    // Create a new simulation interval
    const interval = setInterval(() => {
      const stepIncrement = Math.floor(Math.random() * 20) + 10; // 10-30 steps
      setCurrentSteps((prev) => {
        const newSteps = prev + stepIncrement;
        updateTodaySteps(newSteps);
        console.log(
          `Added ${stepIncrement} simulated steps. Total: ${newSteps}`
        );
        return newSteps;
      });
    }, 5000); // Every 5 seconds

    setSimulationInterval(interval);
    console.log("Step simulation started");
  };

  // Stop step simulation
  const stopStepSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      console.log("Step simulation stopped");
    }
  };

  // Initialize on component mount
  useEffect(() => {
    // Safe initialization with graceful fallback
    const safeInitialize = async () => {
      try {
        // First load saved data
        try {
          await loadStepData();
          console.log("Step data loaded successfully");
        } catch (loadError) {
          console.error("Error loading step data:", loadError);
          // Initialize with default values to prevent undefined/null issues
          setGoalSteps(DEFAULT_GOAL);
          setHistoryData([]);
          setTodaySteps(0);
          setCurrentSteps(0);
        }

        // Try to use Health Connect if on Android
        if (Platform.OS === "android") {
          try {
            // CRITICAL FIX: Add safety check for Health Connect module
            if (typeof getSdkStatus !== "function") {
              console.error(
                "Health Connect module is not properly initialized"
              );
              throw new Error("Health Connect module not available");
            }

            // Check if Health Connect is available
            const isAvailable = await checkHealthConnectAvailability();

            if (isAvailable) {
              console.log(
                "Health Connect is available, attempting to initialize"
              );

              try {
                // CRITICAL FIX: Add safety check for initialize function
                if (typeof initialize !== "function") {
                  console.error(
                    "Health Connect initialize function is not available"
                  );
                  throw new Error(
                    "Health Connect initialize function not available"
                  );
                }

                // Try to initialize Health Connect
                const initResult = await initialize();

                if (initResult) {
                  console.log("Health Connect initialized successfully");
                  setIsHealthConnectAvailable(true);

                  // Don't request permissions automatically - wait for user action
                  return;
                }
              } catch (initError) {
                console.error("Error initializing Health Connect:", initError);
              }
            }
          } catch (healthConnectError) {
            console.error("Health Connect check failed:", healthConnectError);
          }
        }

        // If we reach here, either Health Connect failed or we're not on Android
        console.log("Using accelerometer fallback for step counting");
        setIsUsingFallback(true);
        setIsHealthConnectAvailable(false);
      } catch (error) {
        // Catch any unexpected errors to prevent app crashes
        console.error(
          "Unexpected error during step counter initialization:",
          error
        );
        // Fall back to accelerometer
        setIsUsingFallback(true);
        setIsHealthConnectAvailable(false);
      }
    };

    // Start initialization with error handling
    safeInitialize().catch((error) => {
      console.error("Failed to initialize step counter:", error);
      // Fall back to accelerometer as last resort
      setIsUsingFallback(true);
      setIsHealthConnectAvailable(false);
    });

    // Cleanup on unmount
    return () => {
      try {
        console.log("Cleaning up step counter");
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
        stopStepSimulation();
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    };
  }, []);

  // If using fallback, return accelerometer step counter
  if (isUsingFallback) {
    return accelerometerStepCounter;
  }

  // Calculate progress percentage
  const progress = goalSteps > 0 ? (todaySteps / goalSteps) * 100 : 0;

  // Return the step counter interface
  return {
    isAvailable: isHealthConnectAvailable,
    permissionStatus,
    currentSteps,
    todaySteps,
    goalSteps,
    progress,
    historyData,
    isExpoGo: false, // Health Connect is not available in Expo Go
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
