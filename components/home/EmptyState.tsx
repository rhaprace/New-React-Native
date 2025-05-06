import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { styles } from "@/styles/home.style";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No recent workouts. Start tracking your exercises!" 
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text variant="body2" color="secondary" style={styles.emptyStateText}>
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;
