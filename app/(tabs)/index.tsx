import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS, FONT, SPACING } from "@/constants/theme";
import { styles as homeStyles } from "@/styles/home.style";
import { Text, Card } from "@/components/ui";
import {
  CalorieTracker,
  MacroDisplay,
  MealsList,
  CalorieGoalTracker,
} from "@/components/home";
import { WorkoutsList, WorkoutResetTracker } from "@/components/workout";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";

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
  const { isLoading, hasAccess } = useSubscriptionCheck();
  const today = new Date().toISOString().split("T")[0];
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const dailyCalories = convexUser?.profile?.dailyCalories || 2000;
  const todaysMealsResult = useQuery(
    api.meal.getMealsByDate,
    convexUser?._id
      ? {
          userId: convexUser._id,
          date: today,
        }
      : "skip"
  );

  const todaysMeals = todaysMealsResult ?? [];
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
  const caloriesRemaining = dailyCalories - totalCalories;
  const calorieProgress = Math.min((totalCalories / dailyCalories) * 100, 100);
  const isCalorieGoalReached = totalCalories >= dailyCalories;
  const isCalorieGoalExceeded = totalCalories > dailyCalories * 1.1;
  if (!isLoaded || isLoading || !convexUser) {
    return (
      <View style={homeStyles.loadingContainer}>
        <StatusBar style="dark" />
        <Animated.View
          entering={FadeInDown}
          style={homeStyles.loadingIndicator}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text variant="body1" color="secondary" style={{ marginTop: 12 }}>
            Loading your dashboard...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" />
      <View style={homeStyles.header}>
        <View style={homeStyles.headerContent}>
          <View>
            <Text
              variant="body1"
              color="onPrimary"
              style={homeStyles.welcomeText}
            >
              Welcome back,
            </Text>
            <Text
              variant="h4"
              weight="bold"
              color="onPrimary"
              style={homeStyles.nameText}
            >
              {convexUser.fullname || user?.firstName || "Athlete"}
            </Text>
          </View>
          <TouchableOpacity
            style={homeStyles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={{ uri: convexUser.image || user?.imageUrl }}
              style={homeStyles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>
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
          <WorkoutResetTracker userId={convexUser._id} today={today} />
        </>
      )}

      <ScrollView
        style={homeStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        <Animated.View entering={FadeInDown}>
          <Card style={homeStyles.calorieCard}>
            <CalorieTracker
              dailyCalories={dailyCalories}
              totalCalories={totalCalories}
              caloriesRemaining={caloriesRemaining}
              calorieProgress={calorieProgress}
              isCalorieGoalReached={isCalorieGoalReached}
              isCalorieGoalExceeded={isCalorieGoalExceeded}
              showResetMessage={showResetMessage}
            />
            <MacroDisplay
              totalProtein={totalProtein}
              totalCarbs={totalCarbs}
              totalFat={totalFat}
            />
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown}>
          <Card style={homeStyles.sectionContainer}>
            <MealsList todaysMeals={todaysMeals} />
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown}>
          <Card style={homeStyles.sectionContainer}>
            <WorkoutsList userId={convexUser?._id} />
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT.size.md,
  },
});

export default Home;
