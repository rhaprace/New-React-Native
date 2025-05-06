import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import Text from "./Text";

interface SelectionOption {
  value: string | null;
  label: string;
}

interface SelectionPillsProps {
  options: SelectionOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  horizontal?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  pillTextStyle?: StyleProp<TextStyle>;
  selectedPillTextStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const SelectionPills: React.FC<SelectionPillsProps> = ({
  options,
  selectedValue,
  onSelect,
  label,
  horizontal = true,
  containerStyle,
  pillStyle,
  selectedPillStyle,
  pillTextStyle,
  selectedPillTextStyle,
  labelStyle,
}) => {
  const renderPills = () => {
    const pillsContent = options.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.pill,
          selectedValue === option.value && styles.selectedPill,
          pillStyle,
          selectedValue === option.value && selectedPillStyle,
        ]}
        onPress={() => onSelect(option.value)}
      >
        <Text
          variant="body2"
          weight="semibold"
          color={selectedValue === option.value ? "onPrimary" : "secondary"}
          style={[
            pillTextStyle,
            selectedValue === option.value && selectedPillTextStyle,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ));

    if (horizontal) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContainer}
        >
          {pillsContent}
        </ScrollView>
      );
    }

    return <View style={styles.verticalContainer}>{pillsContent}</View>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="body2"
          weight="bold"
          color="secondary"
          style={[styles.label, labelStyle]}
        >
          {label}
        </Text>
      )}
      {renderPills()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  horizontalContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  verticalContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default SelectionPills;
