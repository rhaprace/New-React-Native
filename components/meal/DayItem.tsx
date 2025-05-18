import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text, Button } from "@/components/ui";
import { COLORS, SPACING } from "@/constants/theme";
import { styles } from "@/styles/meal.style";
import FoodListItem from "@/components/FoodListItem";
import { formatDay } from "@/utils/dayFormatting";

interface MealItem {
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface DayItemProps {
  item: DayPlan;
  index: number;
  expandedDay: string | null;
  onToggleDay: (day: string) => void;

  onOpenRecommendations: (day: string, type: string) => void;
  onOpenCustomMealModal: (day: string) => void;
  onDeleteMeal?: (mealId: any) => void;
  onAddToTodaysFood?: (meal: any) => void;
}

const DayItem: React.FC<DayItemProps> = ({
  item,
  index,
  expandedDay,
  onToggleDay,

  onOpenRecommendations,
  onOpenCustomMealModal,
  onDeleteMeal,
  onAddToTodaysFood,
}) => {
  const isExpanded = expandedDay === item.day;

  const calculateDailyTotals = (dayData: DayPlan) => {
    const { breakfast, lunch, dinner } = dayData;
    return {
      calories: breakfast.calories + lunch.calories + dinner.calories,
      protein: breakfast.protein + lunch.protein + dinner.protein,
      carbs: breakfast.carbs + lunch.carbs + dinner.carbs,
      fat: breakfast.fat + lunch.fat + dinner.fat,
    };
  };

  const dailyTotals = calculateDailyTotals(item);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.dayContainer}
    >
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => onToggleDay(formatDay(item.day))}
      >
        <View style={styles.dayHeaderContent}>
          <Text variant="h5" weight="bold" style={styles.dayText}>
            {formatDay(item.day)}
          </Text>
          <View style={styles.dailyTotalsContainer}>
            <Text variant="body2" color="secondary">
              <Text>{dailyTotals.calories}</Text>
              <Text> cal | </Text>
              <Text>{dailyTotals.protein}g</Text>
              <Text> protein</Text>
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.mealsContainer}>
          <FoodListItem
            meal={item.breakfast}
            mealType="Breakfast"
            onRecommend={() =>
              onOpenRecommendations(formatDay(item.day), "Breakfast")
            }
            onDeleteMeal={onDeleteMeal}
            onAddToTodaysFood={onAddToTodaysFood}
            day={formatDay(item.day)}
          />
          <FoodListItem
            meal={item.lunch}
            mealType="Lunch"
            onRecommend={() =>
              onOpenRecommendations(formatDay(item.day), "Lunch")
            }
            onDeleteMeal={onDeleteMeal}
            onAddToTodaysFood={onAddToTodaysFood}
            day={formatDay(item.day)}
          />
          <FoodListItem
            meal={item.dinner}
            mealType="Dinner"
            onRecommend={() =>
              onOpenRecommendations(formatDay(item.day), "Dinner")
            }
            onDeleteMeal={onDeleteMeal}
            onAddToTodaysFood={onAddToTodaysFood}
            day={formatDay(item.day)}
          />

          <View
            style={{
              marginTop: SPACING.xs,
            }}
          >
            <Button
              variant="primary"
              onPress={() => onOpenCustomMealModal(formatDay(item.day))}
            >
              Add a Custom Meal
            </Button>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default DayItem;
