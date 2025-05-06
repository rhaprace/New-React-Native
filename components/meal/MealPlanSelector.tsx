import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { COLORS, SPACING } from '@/constants/theme';
import { styles } from '@/styles/meal.style';

type MealPlanType = 'weightLoss' | 'weightGain' | 'maintain';

interface MealPlanSelectorProps {
  selectedPlanType: MealPlanType;
  onSelectWeightLoss: () => void;
  onSelectWeightGain: () => void;
  onSelectMaintain: () => void;
}

const MealPlanSelector: React.FC<MealPlanSelectorProps> = ({
  selectedPlanType,
  onSelectWeightLoss,
  onSelectWeightGain,
  onSelectMaintain,
}) => {
  return (
    <View style={styles.planSelectionContainer}>
      <TouchableOpacity
        style={[
          styles.planButton,
          selectedPlanType === "weightLoss" && styles.selectedPlanButton,
        ]}
        onPress={onSelectWeightLoss}
      >
        <Ionicons
          name="trending-down"
          size={20}
          color={
            selectedPlanType === "weightLoss"
              ? COLORS.textOnPrimary
              : COLORS.primary
          }
        />
        <Text
          variant="body2"
          weight="semibold"
          color={selectedPlanType === "weightLoss" ? "onPrimary" : "primary"}
          style={{ marginLeft: SPACING.xs }}
        >
          Weight Loss
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planButton,
          selectedPlanType === "weightGain" && styles.selectedPlanButton,
        ]}
        onPress={onSelectWeightGain}
      >
        <Ionicons
          name="trending-up"
          size={20}
          color={
            selectedPlanType === "weightGain"
              ? COLORS.textOnPrimary
              : COLORS.primary
          }
        />
        <Text
          variant="body2"
          weight="semibold"
          color={selectedPlanType === "weightGain" ? "onPrimary" : "primary"}
          style={{ marginLeft: SPACING.xs }}
        >
          Weight Gain
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planButton,
          selectedPlanType === "maintain" && styles.selectedPlanButton,
        ]}
        onPress={onSelectMaintain}
      >
        <Ionicons
          name="swap-horizontal"
          size={20}
          color={
            selectedPlanType === "maintain"
              ? COLORS.textOnPrimary
              : COLORS.primary
          }
        />
        <Text
          variant="body2"
          weight="semibold"
          color={selectedPlanType === "maintain" ? "onPrimary" : "primary"}
          style={{ marginLeft: SPACING.xs }}
        >
          Maintain
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MealPlanSelector;
