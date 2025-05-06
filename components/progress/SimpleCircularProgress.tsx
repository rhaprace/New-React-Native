import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { SLATE } from "@/constants/theme";

interface SimpleCircularProgressProps {
  value: number;
  radius?: number;
  maxValue?: number;
  title?: string;
  titleColor?: string;
  titleStyle?: object;
  activeStrokeColor?: string;
  inActiveStrokeColor?: string;
  valueSuffix?: string;
  progressValueColor?: string;
}

/**
 * A simple replacement for CircularProgress that doesn't use SVG
 * to avoid issues with react-native-svg
 */
const SimpleCircularProgress: React.FC<SimpleCircularProgressProps> = ({
  value,
  radius = 70,
  maxValue = 100,
  title,
  titleColor = SLATE.slate_500,
  titleStyle,
  activeStrokeColor = SLATE.slate_700,
  inActiveStrokeColor = SLATE.slate_200,
  valueSuffix = "%",
  progressValueColor = SLATE.slate_800,
}) => {
  // Calculate the percentage
  const percentage = Math.min(100, (value / maxValue) * 100);

  // Size calculations
  const size = radius * 2;
  const innerCircleSize = size - 30; // Adjust for stroke width

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: inActiveStrokeColor,
          },
        ]}
      />

      {/* Progress Circle (using border width trick) */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: activeStrokeColor,
            // Use clip path to show only part of the circle
            // This is a simple approximation
            opacity: percentage / 100,
          },
        ]}
      />

      {/* Inner Circle (white background) */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerCircleSize,
            height: innerCircleSize,
            borderRadius: innerCircleSize / 2,
          },
        ]}
      >
        {/* Value Text */}
        <Text variant="h4" weight="bold" style={{ color: progressValueColor }}>
          {Math.round(percentage)}
          {valueSuffix ? <Text>{valueSuffix}</Text> : null}
        </Text>

        {/* Title Text */}
        {title && (
          <Text variant="caption" style={[{ color: titleColor }, titleStyle]}>
            {title}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    borderWidth: 15,
    borderStyle: "solid",
  },
  progressCircle: {
    position: "absolute",
    borderWidth: 15,
    borderStyle: "solid",
  },
  innerCircle: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  titleText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default SimpleCircularProgress;
