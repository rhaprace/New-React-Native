import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text, Card, Button } from "@/components/ui";

type MealItem = {
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  id?: string; // Add ID for deletion
};

type Meal = {
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type FoodListItemProps = {
  meal: Meal;
  mealType: string;
  onAddMeal: (meal: Meal) => void;
  onRecommend?: () => void;
  onDeleteMeal?: (mealId: any) => void; // Add delete handler
  onAddToTodaysFood?: (meal: any) => void; // Add function to add meal to today's food
  day?: string; // Add day for today's food
};

export default function FoodListItem({
  meal,
  mealType,
  onAddMeal,
  onRecommend,
  onDeleteMeal,
  onAddToTodaysFood,
  day,
}: FoodListItemProps) {
  // Get icon based on meal type
  const getMealTypeIcon = () => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "food-croissant";
      case "lunch":
        return "food";
      case "dinner":
        return "food-turkey";
      default:
        return "food-apple";
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <View style={styles.mealTypeContainer}>
        <MaterialCommunityIcons
          name={getMealTypeIcon()}
          size={20}
          color={COLORS.primary}
        />
        <Text
          variant="body1"
          weight="bold"
          color="primary"
          style={{ marginLeft: SPACING.xs }}
        >
          {mealType}
        </Text>
      </View>

      <Card style={styles.container} elevation="sm">
        <View style={styles.mealInfoContainer}>
          <View style={styles.mealTitleContainer}>
            {meal.items && meal.items.length > 0 ? (
              meal.items.map((item, index) => (
                <Text
                  key={index}
                  variant="h5"
                  weight="bold"
                  style={{ lineHeight: 24 }}
                >
                  {item.meal}
                </Text>
              ))
            ) : (
              <Text
                variant="body1"
                color="secondary"
                style={{
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: SPACING.sm,
                }}
              >
                No meals added yet. Click 'Recommended' or '+' to add meals.
              </Text>
            )}
          </View>

          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text
                variant="body2"
                weight="bold"
                color="primary"
                style={{ marginRight: 2 }}
              >
                {meal.calories}
              </Text>
              <Text variant="caption" color="secondary">
                cal
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text
                variant="body2"
                weight="bold"
                color="primary"
                style={{ marginRight: 2 }}
              >
                {meal.protein}g
              </Text>
              <Text variant="caption" color="secondary">
                protein
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text
                variant="body2"
                weight="bold"
                color="primary"
                style={{ marginRight: 2 }}
              >
                {meal.carbs}g
              </Text>
              <Text variant="caption" color="secondary">
                carbs
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text
                variant="body2"
                weight="bold"
                color="primary"
                style={{ marginRight: 2 }}
              >
                {meal.fat}g
              </Text>
              <Text variant="caption" color="secondary">
                fat
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {onRecommend && (
              <Button
                variant="secondary"
                size="sm"
                style={styles.recommendButton}
                onPress={onRecommend}
              >
                Recommended
              </Button>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // Check if we have meal items and onAddToTodaysFood function
                if (onAddToTodaysFood && meal.items && meal.items.length > 0) {
                  // Create a meal object to add to today's food
                  const mealToAdd = {
                    name: meal.items[0].meal,
                    calories: meal.items[0].calories,
                    protein: meal.items[0].protein,
                    carbs: meal.items[0].carbs,
                    fat: meal.items[0].fat,
                    day: day || "",
                    mealType: mealType.toLowerCase(),
                  };

                  // Show a confirmation alert before adding
                  Alert.alert(
                    "Add to Today's Food",
                    `Add ${mealToAdd.name} to today's food?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Add",
                        onPress: () => {
                          // Only add to today's food, don't call onAddMeal
                          // This will add to today's food without affecting the current view
                          onAddToTodaysFood(mealToAdd);
                        },
                      },
                    ]
                  );
                } else if (meal.items && meal.items.length === 0) {
                  // If there are no meal items, show meal options
                  onAddMeal(meal);
                }
                // Do nothing if there's no onAddToTodaysFood and we already have meal items
              }}
            >
              <AntDesign name="plus" size={16} color={COLORS.textOnPrimary} />
            </TouchableOpacity>

            {onDeleteMeal &&
              meal.items &&
              meal.items.length > 0 &&
              meal.items[0].id && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteMeal(meal.items[0].id!)}
                >
                  <AntDesign
                    name="delete"
                    size={16}
                    color={COLORS.textOnPrimary}
                  />
                </TouchableOpacity>
              )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  mealTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    alignSelf: "flex-start",
  },
  container: {
    padding: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: SPACING.xs,
  },
  mealInfoContainer: {
    flex: 1,
    gap: SPACING.sm,
  },
  mealTitleContainer: {
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  nutritionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  nutritionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "column",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  recommendButton: {
    marginBottom: SPACING.xs,
  },

  actionButtons: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
});
