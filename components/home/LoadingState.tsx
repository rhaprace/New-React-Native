import React from "react";
import { ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";

const LoadingState: React.FC = () => {
  return (
    <ActivityIndicator
      size="small"
      color={COLORS.primary}
      style={styles.loadingIndicator}
    />
  );
};

export default LoadingState;
