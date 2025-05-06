import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { styles } from '@/styles/home.style';

interface MacroDisplayProps {
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({
  totalProtein,
  totalCarbs,
  totalFat,
}) => {
  return (
    <View style={styles.macrosContainer}>
      <View style={styles.macroItem}>
        <Text
          variant="h5"
          weight="bold"
          color="primary"
          style={styles.macroValue}
        >
          {totalProtein}g
        </Text>
        <Text
          variant="caption"
          color="secondary"
          style={styles.macroLabel}
        >
          Protein
        </Text>
      </View>
      <View style={styles.macroItem}>
        <Text
          variant="h5"
          weight="bold"
          color="primary"
          style={styles.macroValue}
        >
          {totalCarbs}g
        </Text>
        <Text
          variant="caption"
          color="secondary"
          style={styles.macroLabel}
        >
          Carbs
        </Text>
      </View>
      <View style={styles.macroItem}>
        <Text
          variant="h5"
          weight="bold"
          color="primary"
          style={styles.macroValue}
        >
          {totalFat}g
        </Text>
        <Text
          variant="caption"
          color="secondary"
          style={styles.macroLabel}
        >
          Fat
        </Text>
      </View>
    </View>
  );
};

export default MacroDisplay;
