import { Platform, Alert, Linking } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";
import { Audio } from "expo-av";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Permission types
export type PermissionType =
  | "storage"
  | "audio"
  | "activity"
  | "camera"
  | "notification";

// Permission status
export type PermissionStatus = "granted" | "denied" | "undetermined";

// Interface for permission result
interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
  canAskAgain: boolean;
}

/**
 * Check if the app is running in Expo Go
 */
export const isExpoGo = Constants.executionEnvironment === "storeClient";

/**
 * Get Android version as a number
 */
export const getAndroidVersion = (): number => {
  if (Platform.OS !== "android") return 0;

  const version = Platform.Version.toString();
  return parseInt(version, 10);
};

/**
 * Open app settings
 */
export const openAppSettings = (): void => {
  try {
    Linking.openSettings();
  } catch (error) {
    console.error("Error opening settings:", error);
  }
};

/**
 * Check storage permission status
 */
export const checkStoragePermission = async (): Promise<PermissionResult> => {
  try {
    if (Platform.OS === "ios") {
      // iOS uses the MediaLibrary permission for storage access
      const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      return {
        granted: status === "granted",
        status: status as PermissionStatus,
        canAskAgain,
      };
    } else {
      // For Android, check if we have a stored permission status first
      // We'll use AsyncStorage to track if permission was previously granted
      try {
        const storedPermission = await AsyncStorage.getItem(
          "STORAGE_PERMISSION_GRANTED"
        );
        if (storedPermission === "true") {
          return {
            granted: true,
            status: "granted",
            canAskAgain: true,
          };
        }
      } catch (storageError) {
        console.error("Error reading stored permission:", storageError);
        // Continue with default behavior if storage read fails
      }

      // For Android, we don't actually check permissions here to avoid triggering the file picker
      // We'll just return "undetermined" and let the request function handle it
      return {
        granted: false,
        status: "undetermined",
        canAskAgain: true, // SAF can always be asked again
      };
    }
  } catch (error) {
    console.error("Error checking storage permission:", error);
    return { granted: false, status: "denied", canAskAgain: true };
  }
};

/**
 * Check audio recording permission status
 */
export const checkAudioPermission = async (): Promise<PermissionResult> => {
  try {
    const { status, canAskAgain } = await Audio.getPermissionsAsync();
    return {
      granted: status === "granted",
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error("Error checking audio permission:", error);
    return { granted: false, status: "denied", canAskAgain: true };
  }
};

/**
 * Check activity recognition permission status
 */
export const checkActivityPermission = async (): Promise<PermissionResult> => {
  try {
    // Only Android 10+ (API 29+) requires explicit activity recognition permission
    if (Platform.OS === "android" && getAndroidVersion() >= 29) {
      const { status, canAskAgain } = await Pedometer.getPermissionsAsync();
      return {
        granted: status === "granted",
        status: status as PermissionStatus,
        canAskAgain,
      };
    }

    // For iOS or older Android, no explicit permission needed
    return { granted: true, status: "granted", canAskAgain: true };
  } catch (error) {
    console.error("Error checking activity permission:", error);
    return { granted: false, status: "denied", canAskAgain: true };
  }
};

/**
 * Request permission with proper error handling and user guidance
 */
export const requestPermission = async (
  type: PermissionType,
  options: {
    title?: string;
    message?: string;
    onGranted?: () => void;
    onDenied?: () => void;
  } = {}
): Promise<boolean> => {
  try {
    // Check current permission status first
    let permissionResult: PermissionResult;

    switch (type) {
      case "storage":
        permissionResult = await checkStoragePermission();
        break;
      case "audio":
        permissionResult = await checkAudioPermission();
        break;
      case "activity":
        permissionResult = await checkActivityPermission();
        break;
      default:
        console.error(`Unknown permission type: ${type}`);
        return false;
    }

    // If already granted, return true
    if (permissionResult.granted) {
      options.onGranted?.();
      return true;
    }

    // If can't ask again, direct to settings
    if (!permissionResult.canAskAgain) {
      Alert.alert(
        options.title || "Permission Required",
        options.message ||
          `Please enable ${type} permission in app settings to use this feature.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      options.onDenied?.();
      return false;
    }

    // Request the permission
    let result: boolean = false;

    switch (type) {
      case "storage":
        if (Platform.OS === "ios") {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          result = status === "granted";
        } else {
          // For Android, show an explanation before requesting permission
          Alert.alert(
            options.title || "Storage Access Required",
            options.message ||
              "AtleTech needs access to your device storage to save workout data and media files.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  options.onDenied?.();
                },
              },
              {
                text: "Allow",
                onPress: async () => {
                  try {
                    // Now request the permission
                    const { granted } =
                      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    result = granted;

                    // Store the result for future reference
                    if (granted) {
                      try {
                        await AsyncStorage.setItem(
                          "STORAGE_PERMISSION_GRANTED",
                          "true"
                        );
                      } catch (storageError) {
                        console.error(
                          "Error saving permission status:",
                          storageError
                        );
                      }
                      options.onGranted?.();
                    } else {
                      options.onDenied?.();
                    }
                  } catch (error) {
                    console.error(
                      "Error requesting storage permission:",
                      error
                    );
                    options.onDenied?.();
                  }
                },
              },
            ]
          );
          // Return early since we're handling the callback in the Alert
          return false;
        }
        break;
      case "audio":
        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        result = audioStatus === "granted";
        break;
      case "activity":
        if (Platform.OS === "android" && getAndroidVersion() >= 29) {
          const { granted } = await Pedometer.requestPermissionsAsync();
          result = granted;
        } else {
          result = true; // No explicit permission needed for iOS or older Android
        }
        break;
    }

    if (result) {
      options.onGranted?.();
    } else {
      options.onDenied?.();
    }

    return result;
  } catch (error) {
    console.error(`Error requesting ${type} permission:`, error);
    options.onDenied?.();
    return false;
  }
};

/**
 * Check if all required permissions are granted
 */
export const checkAllPermissions = async (): Promise<{
  [key in PermissionType]?: boolean;
}> => {
  const results: { [key in PermissionType]?: boolean } = {};

  // Check storage permissions
  const storageResult = await checkStoragePermission();
  results.storage = storageResult.granted;

  // Check audio permissions
  const audioResult = await checkAudioPermission();
  results.audio = audioResult.granted;

  // Check activity permissions
  const activityResult = await checkActivityPermission();
  results.activity = activityResult.granted;

  return results;
};

/**
 * Request all required permissions with a single call
 */
export const requestAllPermissions = async (): Promise<boolean> => {
  // Check if storage permission is already granted
  const storageStatus = await checkStoragePermission();

  // Request audio permission
  const audioGranted = await requestPermission("audio", {
    title: "Microphone Access Required",
    message: "AtleTech needs access to your microphone for audio features.",
  });

  // Request activity permission
  const activityGranted = await requestPermission("activity", {
    title: "Activity Recognition Required",
    message:
      "AtleTech needs access to activity recognition to track your steps and workouts.",
  });

  // If storage permission is not granted, request it last
  // This is to prevent the file picker from opening automatically
  if (!storageStatus.granted) {
    // For Android, we'll handle storage permission separately
    if (Platform.OS === "android") {
      // Request storage permission and return the combined result
      requestPermission("storage", {
        title: "Storage Access Required",
        message:
          "AtleTech needs access to your device storage to save workout data and media files.",
      });

      // We'll return based on audio and activity since storage is handled via Alert
      return audioGranted && activityGranted;
    } else {
      // For iOS, request storage permission normally
      const storageGranted = await requestPermission("storage", {
        title: "Storage Access Required",
        message:
          "AtleTech needs access to your device storage to save workout data and media files.",
      });

      return storageGranted && audioGranted && activityGranted;
    }
  }

  // If storage is already granted, return based on audio and activity
  return storageStatus.granted && audioGranted && activityGranted;
};
