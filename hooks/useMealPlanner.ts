import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createEmptyWeeklyMeals } from "@/constants/mealData";
import { RumbleFood, getRecommendationsByGoal } from "@/constants/rumbleFoods";
import { formatDay, getAllDays } from "@/utils/dayFormatting";

// Helper function to get a consistent day number for each day of the week
// This ensures that meals for the same day (e.g., Monday) are always grouped together
function getDayNumber(day: string): string {
  const dayMap: Record<string, string> = {
    Monday: "01",
    Tuesday: "02",
    Wednesday: "03",
    Thursday: "04",
    Friday: "05",
    Saturday: "06",
    Sunday: "07",
  };

  return dayMap[day] || "01"; // Default to Monday if day is not recognized
}

type MealPlanType = "weightLoss" | "weightGain" | "maintain";

export const useMealPlanner = (userId: any, user: any) => {
  const [mealPlan, setMealPlan] = useState(createEmptyWeeklyMeals());
  const [selectedPlanType, setSelectedPlanType] =
    useState<MealPlanType>("weightLoss");
  const [expandedDay, setExpandedDay] = useState<string | null>("Monday");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [mealType, setMealType] = useState("Breakfast");
  const [mealName, setMealName] = useState("");
  const [grams, setGrams] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendModalVisible, setRecommendModalVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<RumbleFood[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RumbleFood | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Fetch all meals for the user (for all days)
  const allMeals = userId
    ? useQuery(api.meal.getAllMeals, {
        userId,
      })
    : null;

  // Mutations
  const addCustomMealMutation = useMutation(api.addCustomMeal.addCustomMeal);
  const createMealMutation = useMutation(api.meal.createMeal);
  const logAddedMealMutation = useMutation(api.meal.logAddedMeal);
  const saveRumbleFoodMutation = useMutation(
    api.meal.saveRumbleFoodRecommendation
  );
  const seedFoodMacrosMutation = useMutation(api.meal.seedFoodMacrosPublic);
  const deleteMealMutation = useMutation(api.meal.deleteMeal);

  // Initialize food database on component mount
  useEffect(() => {
    const initializeFoodDatabase = async () => {
      try {
        await seedFoodMacrosMutation();
        console.log("Food database initialization completed");
      } catch (error) {
        console.error("Error initializing food database:", error);
      }
    };

    initializeFoodDatabase();
  }, [seedFoodMacrosMutation]);

  // Update meal plan when meals data changes
  useEffect(() => {
    if (!user || !userId) return;
    if (!allMeals || allMeals.length === 0) {
      setMealPlan(createEmptyWeeklyMeals());
      return;
    }

    console.log("All meals from database:", allMeals);

    // Count meals by day for debugging
    const mealCountByDay = allMeals.reduce((acc, meal) => {
      const day = formatDay(meal.day);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    console.log("Meal count by day:", mealCountByDay);

    // Create a fresh base meal plan
    const baseMealPlan = createEmptyWeeklyMeals();

    // Log the days in the base meal plan for debugging
    console.log(
      "Base meal plan days:",
      baseMealPlan.map((day) => day.day)
    );

    // Group meals by day and type with consistent formatting
    const mealsByDayAndType = allMeals.reduce(
      (acc, meal) => {
        // Ensure consistent day formatting
        const day = formatDay(meal.day);
        console.log(
          `Processing meal for day: ${meal.day} -> formatted as: ${day}`
        );

        if (!acc[day]) {
          acc[day] = { breakfast: [], lunch: [], dinner: [] };
        }

        const mealType = meal.mealType.toLowerCase();
        if (
          mealType === "breakfast" ||
          mealType === "lunch" ||
          mealType === "dinner"
        ) {
          acc[day][mealType].push(meal);
          console.log(`Added meal to ${day} ${mealType}: ${meal.name}`);
        }

        return acc;
      },
      {} as Record<string, { breakfast: any[]; lunch: any[]; dinner: any[] }>
    );

    console.log("Meals by day and type:", mealsByDayAndType);

    // Log all the keys in mealsByDayAndType for debugging
    console.log("Days with meals:", Object.keys(mealsByDayAndType));

    // Update the meal plan with the meals from the database
    const updatedMealPlan = baseMealPlan.map((dayPlan: any) => {
      // Create a new day plan to avoid mutating the original
      const newDayPlan = { ...dayPlan };

      // Ensure consistent day formatting
      const formattedDay = formatDay(dayPlan.day);
      console.log(
        `Checking for meals for day: ${dayPlan.day} -> formatted as: ${formattedDay}`
      );

      // Get the saved meals for this day
      const savedMeals = mealsByDayAndType[formattedDay];

      if (savedMeals) {
        console.log(`Found saved meals for ${formattedDay}:`, savedMeals);

        // Update each meal type (breakfast, lunch, dinner)
        Object.entries(savedMeals).forEach(([type, meals]) => {
          if (meals.length > 0) {
            console.log(
              `Updating ${formattedDay} ${type} with ${meals.length} meals`
            );

            // Convert the meals to the format expected by the UI
            const mealItems = meals.map((meal) => ({
              meal: meal.name || "",
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0,
              id: meal._id,
            }));

            // Calculate the totals for this meal type
            const totalCalories = meals.reduce(
              (sum, meal) => sum + meal.calories,
              0
            );
            const totalProtein = meals.reduce(
              (sum, meal) => sum + meal.protein,
              0
            );
            const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
            const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

            // Update the meal plan with the new meal data
            const mealKey = type as keyof typeof newDayPlan;
            (newDayPlan[mealKey] as any) = {
              items: mealItems,
              calories: totalCalories,
              protein: totalProtein,
              carbs: totalCarbs,
              fat: totalFat,
            };
          }
        });
      } else {
        console.log(`No saved meals found for ${formattedDay}`);
      }

      return newDayPlan;
    });

    console.log("Updated meal plan:", updatedMealPlan);

    // Log the final meal plan structure for debugging
    updatedMealPlan.forEach((day) => {
      console.log(`Day: ${day.day}`);
      console.log(
        `  Breakfast: ${day.breakfast.items.length} items, ${day.breakfast.calories} calories`
      );
      console.log(
        `  Lunch: ${day.lunch.items.length} items, ${day.lunch.calories} calories`
      );
      console.log(
        `  Dinner: ${day.dinner.items.length} items, ${day.dinner.calories} calories`
      );
    });

    setMealPlan(updatedMealPlan);
  }, [allMeals, user, userId, selectedPlanType, refreshTrigger]);
  const handleWeightLoss = useCallback(() => {
    setSelectedPlanType("weightLoss");
    if (!allMeals || allMeals.length === 0) {
      setMealPlan(createEmptyWeeklyMeals());
    }
  }, [allMeals]);

  const handleWeightGain = useCallback(() => {
    setSelectedPlanType("weightGain");
    if (!allMeals || allMeals.length === 0) {
      setMealPlan(createEmptyWeeklyMeals());
    }
  }, [allMeals]);

  const handleMaintainWeight = useCallback(() => {
    setSelectedPlanType("maintain");
    if (!allMeals || allMeals.length === 0) {
      setMealPlan(createEmptyWeeklyMeals());
    }
  }, [allMeals]);
  const toggleDayExpansion = useCallback(
    (day: string) => {
      setExpandedDay(expandedDay === day ? null : day);
    },
    [expandedDay]
  );
  const checkUserReady = useCallback(() => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to add meals.");
      return false;
    }

    if (!userId) {
      Alert.alert(
        "Error",
        "Your user profile is not fully loaded. Please try again in a moment."
      );
      return false;
    }

    return true;
  }, [user, userId]);
  const handleOpenModal = useCallback(
    (day: string) => {
      if (!checkUserReady()) {
        return;
      }

      // Store the day with proper capitalization to ensure consistency using the utility function
      const formattedDay = formatDay(day);
      setSelectedDay(formattedDay);
      setMealType("");
      setModalVisible(true);

      console.log(`Opening custom meal modal for day: ${formattedDay}`);
    },
    [checkUserReady]
  );

  const handleOpenRecommendations = useCallback(
    (day: string, type: string) => {
      if (!checkUserReady()) {
        return;
      }

      // Store the day with proper capitalization to ensure consistency
      const formattedDay = formatDay(day);
      setSelectedDay(formattedDay);

      // Ensure meal type is properly formatted
      const formattedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      setMealType(formattedType);

      const recommendedFoods = getRecommendationsByGoal(selectedPlanType);
      setRecommendations(recommendedFoods);
      setSelectedRecommendation(null);
      setSelectedCategory(null);
      setRecommendModalVisible(true);

      console.log(
        `Opening recommendations for day: ${formattedDay}, type: ${formattedType}`
      );
    },
    [checkUserReady, selectedPlanType]
  );

  // Function to add a meal from the meal planner to today's food
  const handleAddToTodaysFood = useCallback(
    async (meal: any) => {
      if (!checkUserReady()) {
        return;
      }

      try {
        setLoading(true);
        const currentDate = new Date().toISOString().split("T")[0];
        const formattedDay = formatDay(meal.day);

        // Normalize the meal type for consistent comparison
        const normalizedMealType = meal.mealType.toLowerCase().trim();

        // Generate a unique identifier for this meal to prevent exact duplicates
        // This allows multiple meals of the same type (e.g., multiple breakfast items)
        // but prevents the exact same meal from being added twice
        const mealIdentifier = `${meal.name.toLowerCase().trim()}_${normalizedMealType}_${currentDate}`;

        console.log(
          `Checking for duplicate meal with identifier: ${mealIdentifier}`
        );

        // Check if the exact same meal already exists in today's food before adding it
        const existingMeals = allMeals?.filter((existingMeal) => {
          const existingMealType = existingMeal.mealType.toLowerCase().trim();
          const nameMatches =
            existingMeal.name.toLowerCase().trim() ===
            meal.name.toLowerCase().trim();
          const dateMatches = existingMeal.date === currentDate;
          const typeMatches = existingMealType === normalizedMealType;

          // Only consider it a duplicate if it's the exact same meal on the same day
          return dateMatches && nameMatches && typeMatches;
        });

        if (existingMeals && existingMeals.length > 0) {
          // Meal already exists in today's food
          Alert.alert(
            "Already Added",
            `${meal.name} is already in today's food (${meal.calories} calories)`
          );
          setLoading(false);
          return;
        }

        console.log(
          `Adding meal to today's food: ${meal.name}, type: ${normalizedMealType}`
        );

        // Add the meal to today's food using the current date
        const mealResult = await createMealMutation({
          userId: userId!,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          date: currentDate, // Use current date for today's food
          day: formattedDay,
          mealType: normalizedMealType, // Use normalized meal type
        });

        // Check if the meal was actually created (not a duplicate)
        if (mealResult.duplicate) {
          Alert.alert(
            "Already Added",
            `${meal.name} is already in today's food (${meal.calories} calories)`
          );
          setLoading(false);
          return;
        }

        // Log the added meal
        const logResult = await logAddedMealMutation({
          userId: userId!,
          mealName: meal.name,
          mealType: normalizedMealType, // Use normalized meal type
          day: formattedDay,
          date: currentDate, // Use current date for today's food
        });

        Alert.alert(
          "Success",
          `Added ${meal.name} to today's food (${meal.calories} calories)`
        );

        // Trigger a refresh to update the meal plan with the latest data
        // But don't refresh the current view to avoid duplication
        // We only want to add to today's food, not to the current meal plan

        // Force a refresh of the allMeals data to ensure we have the latest meals
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error adding meal to today's food:", error);
        Alert.alert(
          "Error",
          "There was an error adding the meal to today's food. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [checkUserReady, createMealMutation, logAddedMealMutation, userId, allMeals]
  );

  const handleAddMeal = useCallback(
    async (day: string, type: string) => {
      if (!checkUserReady()) {
        return;
      }

      try {
        const dayItem = mealPlan.find((item: any) => item.day === day);
        if (!dayItem) {
          throw new Error("Day not found in meal plan");
        }

        const mealKey = type.toLowerCase();
        const mealData = dayItem[mealKey as keyof typeof dayItem] as any;

        if (!mealData) {
          throw new Error("Meal type not found");
        }

        // If there are no meals for this day and meal type, show options to add a meal
        if (!mealData.items || mealData.items.length === 0) {
          Alert.alert(
            "Add a Meal",
            `There is no meal set for ${type} on ${day}. What would you like to do?`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Add Recommended Meal",
                onPress: () => {
                  // Open the recommendations modal for this day and meal type
                  handleOpenRecommendations(day, type);
                },
              },
              {
                text: "Add Custom Meal",
                onPress: () => {
                  // Open the custom meal modal for this day
                  handleOpenModal(day);
                  // Pre-select the meal type
                  setMealType(type);
                },
              },
            ]
          );
          return;
        }

        // If there are meals for this day and meal type, proceed with adding to today's food
        Alert.alert(
          "Add to Today's Food",
          `Do you want to add ${mealData.items[0].meal} to today's food in your homepage?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Add",
              onPress: () => {
                // Create a meal object from the meal data
                const meal = {
                  name: mealData.items[0].meal,
                  calories: mealData.items[0].calories,
                  protein: mealData.items[0].protein,
                  carbs: mealData.items[0].carbs,
                  fat: mealData.items[0].fat,
                  day: formatDay(day),
                  mealType: mealKey,
                };

                // Use the handleAddToTodaysFood function to add the meal to today's food
                handleAddToTodaysFood(meal);
              },
            },
          ]
        );
      } catch (error) {
        console.error("Error preparing meal:", error);
        Alert.alert(
          "Error",
          "There was an error preparing your meal. Please try again."
        );
      }
    },
    [
      checkUserReady,
      mealPlan,
      userId,
      handleOpenModal,
      setMealType,
      handleAddToTodaysFood,
    ]
  );
  const handleAddCustomMeal = useCallback(async () => {
    if (!checkUserReady()) {
      return;
    }

    if (!mealName || !grams || !mealType) {
      Alert.alert("Error", "Please fill in all fields and select a meal type.");
      return;
    }

    setLoading(true);
    try {
      // First try to seed the food database to ensure it exists
      try {
        await seedFoodMacrosMutation();
        console.log("Food database initialized/updated");
      } catch (seedError) {
        console.log("Food database already initialized or error:", seedError);
      }

      // Ensure the day is properly formatted for database storage using the utility function
      const formattedDay = selectedDay ? formatDay(selectedDay) : "";
      if (!formattedDay) {
        Alert.alert("Error", "Please select a day for your meal.");
        setLoading(false);
        return;
      }

      console.log(
        `Adding custom meal for day: ${selectedDay} -> formatted as: ${formattedDay}`
      );

      // Normalize meal type for consistent handling
      const normalizedMealType = mealType.toLowerCase().trim();

      // For display purposes, use properly capitalized meal type
      const displayMealType =
        normalizedMealType.charAt(0).toUpperCase() +
        normalizedMealType.slice(1);

      console.log(
        `Meal type: ${mealType} -> normalized as: ${normalizedMealType}, display: ${displayMealType}`
      );

      // For meal planning, we'll use a fixed date format that's consistent for all days
      const planningDate = `2023-01-${getDayNumber(formattedDay)}`;
      console.log(
        `Using planning date: ${planningDate} for day: ${formattedDay}`
      );

      // Check if this meal already exists for this day and meal type
      const existingMeals = allMeals?.filter((existingMeal) => {
        const existingMealType = existingMeal.mealType.toLowerCase().trim();
        const nameMatches =
          existingMeal.name.toLowerCase().trim() ===
          mealName.toLowerCase().trim();
        const dayMatches = formatDay(existingMeal.day) === formattedDay;
        const typeMatches = existingMealType === normalizedMealType;

        return dayMatches && nameMatches && typeMatches;
      });

      if (existingMeals && existingMeals.length > 0) {
        Alert.alert(
          "Already Added",
          `${mealName} is already added to ${displayMealType} for ${formattedDay}`
        );
        setLoading(false);
        return;
      }

      console.log(
        `Adding custom meal: ${mealName}, ${grams}g, for ${formattedDay}, ${normalizedMealType}`
      );

      // For meal planning, we use the planning date to organize meals by day
      const result = await addCustomMealMutation({
        userId: userId!,
        mealName,
        mealType: normalizedMealType,
        grams: parseFloat(grams),
        day: formattedDay, // Properly formatted day
        date: planningDate, // Use planning date for meal planner
      });

      console.log("Added custom meal result:", result);

      if (result.success) {
        // Instead of manually updating the meal plan, trigger a refresh to fetch the latest data
        setModalVisible(false);
        setMealName("");
        setGrams("");
        setMealType("");

        Alert.alert(
          "Success",
          `Added ${mealName} to ${displayMealType} for ${formattedDay} (${result.mealData?.calories || 0} calories)`
        );

        // Trigger a refresh to update the meal plan with the latest data from the database
        console.log("Triggering refresh to update meal plan");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        Alert.alert("Error", result.message || "Failed to add meal");
      }
    } catch (error) {
      console.error("Error adding custom meal:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was an error adding your meal. Please try again.";

      if (
        errorMessage.includes("not found in the database") ||
        errorMessage.includes("No food items found")
      ) {
        Alert.alert(
          "Food Not Found",
          "The food item you entered was not found in our database. Please try a different food name or check your spelling."
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    addCustomMealMutation,
    checkUserReady,
    grams,
    mealName,
    mealType,
    seedFoodMacrosMutation,
    selectedDay,
    userId,
    allMeals,
  ]);
  const handleCategoryFilter = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      if (category === null) {
        setRecommendations(getRecommendationsByGoal(selectedPlanType));
      } else {
        const filteredRecommendations = getRecommendationsByGoal(
          selectedPlanType
        ).filter((food) => food.category === category);
        setRecommendations(filteredRecommendations);
      }
    },
    [selectedPlanType]
  );
  const handleSelectRecommendation = useCallback((food: RumbleFood) => {
    setSelectedRecommendation(food);
  }, []);
  const handleAddRecommendation = useCallback(async () => {
    if (!selectedRecommendation || !selectedDay) {
      Alert.alert("Error", "Please select a food recommendation first.");
      return;
    }

    setLoading(true);
    try {
      // Ensure day is properly formatted
      const formattedDay = formatDay(selectedDay);
      console.log(
        `Adding recommendation for day: ${selectedDay} -> formatted as: ${formattedDay}`
      );

      // Ensure meal type is properly formatted
      const formattedMealType =
        mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
      const mealKey = formattedMealType.toLowerCase();
      console.log(
        `Meal type: ${mealType} -> formatted as: ${formattedMealType}, key: ${mealKey}`
      );

      console.log(
        `Adding recommendation: ${selectedRecommendation.name} for ${formattedDay}, ${mealKey}`
      );

      // Use the current date for today's entries, but we need to use a consistent date for all days
      // This ensures that meals are properly associated with their respective days
      const currentDate = new Date().toISOString().split("T")[0];

      // For meal planning, we'll use a fixed date format that's consistent for all days
      // This ensures that all meals for a specific day (e.g., Monday) are grouped together
      // regardless of when they were added
      const planningDate = `2023-01-${getDayNumber(formattedDay)}`;
      console.log(
        `Using planning date: ${planningDate} for day: ${formattedDay}`
      );

      // First, add the meal to the database using createMeal mutation
      // For meal planning, we use the planning date to organize meals by day
      const mealResult = await createMealMutation({
        userId: userId!,
        name: selectedRecommendation.name,
        calories: selectedRecommendation.calories,
        protein: selectedRecommendation.protein,
        carbs: selectedRecommendation.carbs,
        fat: selectedRecommendation.fat,
        date: planningDate, // Use planning date for meal planner
        day: formattedDay, // Properly formatted day
        mealType: mealKey,
      });

      console.log("Added meal result:", mealResult);

      // Then log the added meal
      const logResult = await logAddedMealMutation({
        userId: userId!,
        mealName: selectedRecommendation.name,
        mealType: mealKey,
        day: formattedDay, // Properly formatted day
        date: planningDate, // Use planning date for meal planner
      });

      console.log("Logged meal result:", logResult);

      // Also call the saveRumbleFoodMutation for backward compatibility
      const result = await saveRumbleFoodMutation({
        userId: userId!,
        foodId: selectedRecommendation.id,
        name: selectedRecommendation.name,
        calories: selectedRecommendation.calories,
        protein: selectedRecommendation.protein,
        carbs: selectedRecommendation.carbs,
        fat: selectedRecommendation.fat,
        category: selectedRecommendation.category,
        day: formattedDay, // Ensure consistent day formatting
        date: planningDate, // Use planning date for meal planner
        mealType: mealKey,
      });

      console.log("Saved meal recommendation result:", result);

      setRecommendModalVisible(false);
      setSelectedRecommendation(null);

      Alert.alert(
        "Success",
        `Added ${selectedRecommendation.name} to ${formattedMealType} for ${formattedDay} (${selectedRecommendation.calories} calories)`
      );

      // Trigger a refresh to update the meal plan with the latest data from the database
      console.log(
        "Triggering refresh to update meal plan after adding recommendation"
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding recommendation:", error);
      Alert.alert(
        "Error",
        "There was an error adding the recommendation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    mealType,
    saveRumbleFoodMutation,
    createMealMutation,
    logAddedMealMutation,
    selectedDay,
    selectedRecommendation,
    userId,
  ]);

  const handleDeleteMeal = useCallback(
    async (mealId: any) => {
      if (!checkUserReady() || !mealId) {
        return;
      }

      try {
        setLoading(true);
        await deleteMealMutation({ mealId });
        setRefreshTrigger((prev) => prev + 1);

        Alert.alert("Success", "Meal deleted successfully");
      } catch (error) {
        console.error("Error deleting meal:", error);
        Alert.alert("Error", "Failed to delete the meal. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [checkUserReady, deleteMealMutation]
  );

  return {
    mealPlan,
    selectedPlanType,
    expandedDay,
    modalVisible,
    selectedDay,
    mealType,
    mealName,
    grams,
    loading,
    recommendModalVisible,
    recommendations,
    selectedRecommendation,
    selectedCategory,
    handleWeightLoss,
    handleWeightGain,
    handleMaintainWeight,
    toggleDayExpansion,
    handleOpenModal,
    handleAddMeal,
    handleAddCustomMeal,
    handleOpenRecommendations,
    handleCategoryFilter,
    handleSelectRecommendation,
    handleAddRecommendation,
    handleAddToTodaysFood, // Add the new function
    handleDeleteMeal,
    setModalVisible,
    setMealType,
    setMealName,
    setGrams,
    setRecommendModalVisible,
  };
};

export default useMealPlanner;
