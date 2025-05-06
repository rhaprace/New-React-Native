import React from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/meal.style";
import { Text } from "@/components/ui";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { formatDay } from "@/utils/dayFormatting";
import {
  MealPlanSelector,
  DayItem,
  CustomMealModal,
  RecommendationModal,
} from "@/components/meal";

export default function MealPlanner() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;
  const {
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
  } = useMealPlanner(userId, user);
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="h2"
          weight="bold"
          color="onPrimary"
          style={styles.headerTitle}
        >
          Meal Planner
        </Text>
        <Text variant="body1" color="onPrimary" style={{ opacity: 0.9 }}>
          Plan your meals for optimal nutrition
        </Text>
      </View>
      {(!user || !userId) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text variant="body1" color="secondary" style={{ marginTop: 8 }}>
            Loading your meal plan...
          </Text>
        </View>
      )}
      <MealPlanSelector
        selectedPlanType={selectedPlanType}
        onSelectWeightLoss={handleWeightLoss}
        onSelectWeightGain={handleWeightGain}
        onSelectMaintain={handleMaintainWeight}
      />
      <FlatList
        data={mealPlan}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.day}
        renderItem={({ item, index }) => (
          <DayItem
            item={item}
            index={index}
            expandedDay={expandedDay}
            onToggleDay={toggleDayExpansion}
            onAddMeal={handleAddMeal}
            onOpenRecommendations={handleOpenRecommendations}
            onOpenCustomMealModal={handleOpenModal}
            onDeleteMeal={handleDeleteMeal}
            onAddToTodaysFood={handleAddToTodaysFood}
          />
        )}
      />
      <CustomMealModal
        visible={modalVisible}
        selectedDay={selectedDay ? formatDay(selectedDay) : null}
        mealType={mealType}
        mealName={mealName}
        grams={grams}
        loading={loading}
        onClose={() => setModalVisible(false)}
        onChangeMealName={setMealName}
        onChangeGrams={setGrams}
        onSelectMealType={setMealType}
        onAddCustomMeal={handleAddCustomMeal}
      />
      <RecommendationModal
        visible={recommendModalVisible}
        selectedDay={selectedDay ? formatDay(selectedDay) : null}
        mealType={mealType}
        selectedPlanType={selectedPlanType}
        recommendations={recommendations}
        selectedRecommendation={selectedRecommendation}
        selectedCategory={selectedCategory}
        loading={loading}
        onClose={() => setRecommendModalVisible(false)}
        onCategoryFilter={handleCategoryFilter}
        onSelectRecommendation={handleSelectRecommendation}
        onAddRecommendation={handleAddRecommendation}
      />
    </View>
  );
}
