import React from "react";
import { View, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, Button } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";
import { useRouter } from "expo-router";

interface Meal {
  _id: any;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
  day?: string;
  userId?: any;
}

interface MealsListProps {
  todaysMeals: Meal[] | undefined;
}

const MealsList: React.FC<MealsListProps> = ({ todaysMeals }) => {
  const router = useRouter();

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons
            name="food-apple"
            size={22}
            color={COLORS.primary}
          />
          <Text variant="h5" weight="semibold" style={styles.sectionTitle}>
            Today's Food
          </Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          style={styles.addButton}
          onPress={() => router.push("/meal")}
        >
          ADD FOOD
        </Button>
      </View>

      {todaysMeals && todaysMeals.length > 0 ? (
        <FlatList
          data={todaysMeals}
          keyExtractor={(item) =>
            item._id ? item._id.toString() : Math.random().toString()
          }
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.mealItem}>
              <View style={styles.mealTypeContainer}>
                <MaterialCommunityIcons
                  name={
                    item.mealType?.toLowerCase() === "breakfast"
                      ? "food-croissant"
                      : item.mealType?.toLowerCase() === "lunch"
                        ? "food"
                        : "food-turkey"
                  }
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.mealTypeText}>
                  {item.mealType
                    ? item.mealType.charAt(0).toUpperCase() +
                      item.mealType.slice(1)
                    : "Meal"}
                </Text>
              </View>
              <View style={styles.mealContent}>
                <Text style={styles.mealName}>{item.name}</Text>
                <View style={styles.mealNutrition}>
                  <View style={styles.nutritionPill}>
                    <Text style={styles.nutritionPillText}>
                      {item.calories} cal
                    </Text>
                  </View>
                  <View style={styles.nutritionPill}>
                    <Text style={styles.nutritionPillText}>
                      {item.protein}g protein
                    </Text>
                  </View>
                  <View style={styles.nutritionPill}>
                    <Text style={styles.nutritionPillText}>
                      {item.carbs}g carbs
                    </Text>
                  </View>
                  <View style={styles.nutritionPill}>
                    <Text style={styles.nutritionPillText}>
                      {item.fat}g fat
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="body1" color="secondary" style={styles.emptyText}>
            No meals logged today
          </Text>
        </View>
      )}
    </View>
  );
};

export default MealsList;
