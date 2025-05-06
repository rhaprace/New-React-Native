import React, { useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.style";
import { Text, Card } from "@/components/ui";
import {
  CalorieTracker,
  MacroDisplay,
  MealsList,
  CalorieGoalTracker,
} from "@/components/home";
import { WorkoutsList, WorkoutResetTracker } from "@/components/workout";

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

const Home = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showResetMessage, setShowResetMessage] = useState(false);

  // Get user data
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  const profile = convexUser?.profile;
  const dailyCalories = profile?.dailyCalories || 2000;
  const today = new Date().toISOString().split("T")[0];

  // Get today's meals
  const todaysMealsResult = useQuery(
    api.meal.getMealsByDate,
    convexUser?._id
      ? {
          userId: convexUser._id,
          date: today,
        }
      : "skip"
  );

  const todaysMeals =
    convexUser?._id && todaysMealsResult !== undefined
      ? (todaysMealsResult as Meal[] | undefined)
      : [];

  // Calculate nutrition totals
  const totalCalories =
    todaysMeals?.reduce(
      (sum: number, meal: Meal) => sum + (meal.calories || 0),
      0
    ) || 0;

  const totalProtein =
    todaysMeals?.reduce(
      (sum: number, meal: Meal) => sum + (meal.protein || 0),
      0
    ) || 0;

  const totalCarbs =
    todaysMeals?.reduce(
      (sum: number, meal: Meal) => sum + (meal.carbs || 0),
      0
    ) || 0;

  const totalFat =
    todaysMeals?.reduce(
      (sum: number, meal: Meal) => sum + (meal.fat || 0),
      0
    ) || 0;

  // Calculate calorie stats
  const caloriesRemaining = dailyCalories - totalCalories;
  const calorieProgress = Math.min((totalCalories / dailyCalories) * 100, 100);
  const isCalorieGoalReached = totalCalories >= dailyCalories;
  const isCalorieGoalExceeded = totalCalories > dailyCalories * 1.1; // Exceeded by 10%

  // Loading state
  if (!isLoaded || !convexUser) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Animated.View entering={FadeInDown} style={styles.loadingIndicator}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={COLORS.primary}
          />
          <Text variant="body1" color="primary" style={{ marginTop: 12 }}>
            Loading your dashboard...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="body1" color="onPrimary" style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text
              variant="h4"
              weight="bold"
              color="onPrimary"
              style={styles.nameText}
            >
              {convexUser.fullname || user?.firstName || "Athlete"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={{ uri: convexUser.image || user?.imageUrl }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calorie Goal Tracker (invisible component for logic) */}
      {convexUser._id && (
        <>
          <CalorieGoalTracker
            userId={convexUser._id}
            today={today}
            isCalorieGoalReached={isCalorieGoalReached}
            isCalorieGoalExceeded={isCalorieGoalExceeded}
            totalCalories={totalCalories}
            dailyCalories={dailyCalories}
            setShowResetMessage={setShowResetMessage}
          />

          {/* Workout Reset Tracker (invisible component for workout reset logic) */}
          <WorkoutResetTracker userId={convexUser._id} today={today} />
        </>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calories Card */}
        <Animated.View entering={FadeInDown}>
          <Card style={styles.calorieCard}>
            {/* Calorie Tracker Component */}
            <CalorieTracker
              dailyCalories={dailyCalories}
              totalCalories={totalCalories}
              caloriesRemaining={caloriesRemaining}
              calorieProgress={calorieProgress}
              isCalorieGoalReached={isCalorieGoalReached}
              isCalorieGoalExceeded={isCalorieGoalExceeded}
              showResetMessage={showResetMessage}
            />

            {/* Macros Display Component */}
            <MacroDisplay
              totalProtein={totalProtein}
              totalCarbs={totalCarbs}
              totalFat={totalFat}
            />
          </Card>
        </Animated.View>

        {/* Today's Food Section */}
        <Animated.View entering={FadeInDown}>
          <Card style={styles.sectionContainer}>
            <MealsList todaysMeals={todaysMeals} />
          </Card>
        </Animated.View>

        {/* Recent Workouts Section */}
        <Animated.View entering={FadeInDown}>
          <Card style={styles.sectionContainer}>
            <WorkoutsList userId={convexUser?._id} />
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Home;
