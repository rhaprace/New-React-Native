import React from 'react';
import { 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  TouchableOpacity
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

export const Card = ({
  children,
  style,
  onPress,
  elevation = 'sm',
  variant = 'default',
}: CardProps) => {
  // Determine card styles based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'filled':
        return styles.filledCard;
      default:
        return styles.defaultCard;
    }
  };

  // Determine shadow styles based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'sm':
        return SHADOW.sm;
      case 'md':
        return SHADOW.md;
      case 'lg':
        return SHADOW.lg;
      default:
        return SHADOW.sm;
    }
  };

  // Combine all styles
  const cardStyles = [
    styles.card,
    getCardStyle(),
    elevation !== 'none' && getShadowStyle(),
    style,
  ];

  // If onPress is provided, wrap in TouchableOpacity, otherwise use View
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyles} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    padding: 16,
  },
  defaultCard: {
    backgroundColor: COLORS.surface,
  },
  outlinedCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filledCard: {
    backgroundColor: COLORS.surfaceAlt,
  },
});

export default Card;
