import React from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "@/styles/workout.styles";
import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";

interface WeightGoalSelectorProps {
  weightGoal: "loss" | "gain" | "maintain";
  onSelectGoal: (goal: "loss" | "gain" | "maintain") => void;
}

const WeightGoalSelector: React.FC<WeightGoalSelectorProps> = ({
  weightGoal,
  onSelectGoal,
}) => {
  return (
    <View style={[styles.sectionContainer, { marginBottom: 8 }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weight Goal</Text>
      </View>
      <View style={[styles.goalSelector, { marginTop: 8 }]}>
        <TouchableOpacity
          style={[
            styles.goalButton,
            weightGoal === "loss" && styles.activeGoalButton,
          ]}
          onPress={() => onSelectGoal("loss")}
        >
          <MaterialCommunityIcons
            name="trending-down"
            size={16}
            color={
              weightGoal === "loss"
                ? COLORS.textOnPrimary
                : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.goalButtonText,
              weightGoal === "loss" && styles.activeGoalButtonText,
            ]}
          >
            Weight Loss
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.goalButton,
            weightGoal === "maintain" && styles.activeGoalButton,
          ]}
          onPress={() => onSelectGoal("maintain")}
        >
          <MaterialCommunityIcons
            name="trending-neutral"
            size={16}
            color={
              weightGoal === "maintain"
                ? COLORS.textOnPrimary
                : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.goalButtonText,
              weightGoal === "maintain" && styles.activeGoalButtonText,
            ]}
          >
            Maintain
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.goalButton,
            weightGoal === "gain" && styles.activeGoalButton,
          ]}
          onPress={() => onSelectGoal("gain")}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={16}
            color={
              weightGoal === "gain"
                ? COLORS.textOnPrimary
                : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.goalButtonText,
              weightGoal === "gain" && styles.activeGoalButtonText,
            ]}
          >
            Weight Gain
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WeightGoalSelector;
