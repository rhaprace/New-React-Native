import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { Button } from "@/components/ui/Button";
import {
  checkAllPermissions,
  requestAllPermissions,
  openAppSettings,
  PermissionType,
} from "../utils/permissionUtils";

interface PermissionHandlerProps {
  onPermissionsResolved: () => void;
}

const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  onPermissionsResolved,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<{
    [key in PermissionType]?: boolean;
  }>({});
  const [isChecking, setIsChecking] = useState(true);
  const [showPermissionUI, setShowPermissionUI] = useState(false);

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check all required permissions
  const checkPermissions = async () => {
    setIsChecking(true);
    try {
      const status = await checkAllPermissions();
      setPermissionStatus(status);

      // If all required permissions are granted, call the callback
      if (areAllPermissionsGranted(status)) {
        onPermissionsResolved();
      } else {
        setShowPermissionUI(true);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setShowPermissionUI(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Check if all required permissions are granted
  const areAllPermissionsGranted = (status: {
    [key in PermissionType]?: boolean;
  }) => {
    // On iOS, we don't need activity recognition permission
    const requiredPermissions: PermissionType[] =
      Platform.OS === "ios"
        ? ["storage", "audio"]
        : ["storage", "audio", "activity"];

    return requiredPermissions.every(
      (permission) => status[permission] === true
    );
  };

  // Request all permissions
  const handleRequestPermissions = async () => {
    try {
      const granted = await requestAllPermissions();

      if (granted) {
        // All permissions granted, call the callback
        onPermissionsResolved();
      } else {
        // Some permissions were denied, update status and show UI
        const newStatus = await checkAllPermissions();
        setPermissionStatus(newStatus);

        // If all required permissions are now granted, call the callback
        if (areAllPermissionsGranted(newStatus)) {
          onPermissionsResolved();
        } else {
          // Show alert to explain why permissions are needed
          Alert.alert(
            "Permissions Required",
            "Some permissions were denied. The app may not function correctly without these permissions.",
            [
              { text: "Continue Anyway", onPress: onPermissionsResolved },
              { text: "Open Settings", onPress: openAppSettings },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);

      // Show alert and continue anyway
      Alert.alert(
        "Permission Error",
        "There was an error requesting permissions. The app may not function correctly.",
        [{ text: "Continue Anyway", onPress: onPermissionsResolved }]
      );
    }
  };

  // If permissions are being checked or all permissions are granted, don't show UI
  if (isChecking || !showPermissionUI) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Permissions Required</Text>

        <Text style={styles.description}>
          AtleTech needs the following permissions to function properly:
        </Text>

        <View style={styles.permissionList}>
          <Text style={styles.permissionItem}>
            • Storage: {permissionStatus.storage ? "✓" : "✗"}
            {!permissionStatus.storage && " (Required for saving workout data)"}
          </Text>

          <Text style={styles.permissionItem}>
            • Microphone: {permissionStatus.audio ? "✓" : "✗"}
            {!permissionStatus.audio && " (Required for audio features)"}
          </Text>

          {Platform.OS === "android" && (
            <Text style={styles.permissionItem}>
              • Activity Recognition: {permissionStatus.activity ? "✓" : "✗"}
              {!permissionStatus.activity && " (Required for step tracking)"}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button variant="primary" onPress={handleRequestPermissions}>
            Grant Permissions
          </Button>

          <Button
            variant="outline"
            onPress={onPermissionsResolved}
            style={styles.skipButton}
          >
            Continue Anyway
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  permissionList: {
    marginBottom: 20,
  },
  permissionItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    alignItems: "center",
  },
  skipButton: {
    marginTop: 10,
  },
});

export default PermissionHandler;
