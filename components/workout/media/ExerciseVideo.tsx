import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/[day].style";
import { Video, ResizeMode } from "expo-av";
import { Text } from "@/components/ui";

type VideoMap = {
  [key: string]: any;
};

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
  return videoMap[filename] || videoMap["squats.mp4"];
};

type ExerciseVideoProps = {
  videoUrl?: string;
};

const ExerciseVideo = ({ videoUrl }: ExerciseVideoProps) => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>({});
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setIsMutedAsync(true);
    }
  }, []);

  const handleError = (error: string) => {
    console.error("Video error:", error);
    setError("Error loading video");
  };

  if (!videoUrl) {
    return (
      <View style={styles.videoPlaceholder}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={40}
          color={COLORS.primary}
        />
        <Text
          variant="body2"
          color="secondary"
          style={styles.videoPlaceholderText}
        >
          Exercise demonstration not available
        </Text>
      </View>
    );
  }

  if (videoUrl.startsWith("http")) {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons
            name="youtube"
            size={40}
            color={COLORS.error}
          />
          <Text
            variant="body2"
            color="primary"
            style={styles.videoPlaceholderText}
          >
            External video not supported
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.videoPlaceholder}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={40}
          color={COLORS.error}
        />
        <Text
          variant="body2"
          color="secondary"
          style={styles.videoPlaceholderText}
        >
          Error loading video
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.videoContainer, { height: 300 }]}>
      <Video
        ref={videoRef}
        source={getExerciseVideo(videoUrl)}
        style={styles.videoPlayer}
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        useNativeControls
        onError={(error) => handleError(error as string)}
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
    </View>
  );
};

export default ExerciseVideo;
