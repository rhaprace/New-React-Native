import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/[day].style";
import * as Linking from "expo-linking";

// Define the type for video mapping
type VideoMap = {
  [key: string]: number; // React Native's require returns a number for assets
};

// Video mapping for local video files
const videoMap: VideoMap = {
  "bench-press.mp4": require("@/assets/videos/bench-press.mp4"),
  "squats.mp4": require("@/assets/videos/squats.mp4"),
  "plank.mp4": require("@/assets/videos/plank.mp4"),
  "bicep-curls.mp4": require("@/assets/videos/bicep-curls.mp4"),
  "deadlifts.mp4": require("@/assets/videos/deadlifts.mp4"),
  "lunges.mp4": require("@/assets/videos/lunges.mp4"),
  "pull-ups.mp4": require("@/assets/videos/pull-ups.mp4"),
  "russian-twists.mp4": require("@/assets/videos/russian-twists.mp4"),
  "sit-ups.mp4": require("@/assets/videos/sit-ups.mp4"),
  "stretching.mp4": require("@/assets/videos/stretching.mp4"),
  "tricep-dips.mp4": require("@/assets/videos/tricep-dips.mp4"),
  "yoga.mp4": require("@/assets/videos/yoga.mp4"),
  "barbell-rows.mp4": require("@/assets/videos/barbell-rows.mp4"),
};

const getExerciseVideo = (filename: string) => {
  return videoMap[filename] || videoMap["squats.mp4"]; // Default to squats if not found
};

type ExerciseVideoProps = {
  videoUrl?: string;
};

const ExerciseVideo = ({ videoUrl }: ExerciseVideoProps) => {
  if (!videoUrl) {
    return (
      <View style={styles.videoPlaceholder}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={40}
          color={COLORS.primary}
        />
        <Text
          style={[styles.videoPlaceholderText, { color: COLORS.textSecondary }]}
        >
          Exercise demonstration not available
        </Text>
      </View>
    );
  }

  if (videoUrl.startsWith("http")) {
    return (
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => Linking.openURL(videoUrl)}
      >
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons
            name="youtube"
            size={40}
            color={COLORS.error}
          />
          <Text
            style={[styles.videoPlaceholderText, { color: COLORS.primary }]}
          >
            Tap to watch video demonstration
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <Image
        source={getExerciseVideo(videoUrl)}
        style={styles.gifImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default ExerciseVideo;
