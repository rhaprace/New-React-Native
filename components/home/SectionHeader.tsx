import React from "react";
import { View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, Button } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";

interface SectionHeaderProps {
  title: string;
  iconName: string;
  buttonText: string;
  onButtonPress: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  iconName,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <FontAwesome5 name={iconName} size={18} color={COLORS.primary} />
        <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
          {title}
        </Text>
      </View>
      <Button
        variant="outline"
        size="sm"
        style={styles.addButton}
        onPress={onButtonPress}
      >
        {buttonText}
      </Button>
    </View>
  );
};

export default SectionHeader;
