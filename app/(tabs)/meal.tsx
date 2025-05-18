import React from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS, FONT, SPACING } from "@/constants/theme";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { useUser } from "@clerk/clerk-expo";
import { styles as mealStyles } from "@/styles/meal.style";
import { Text } from "@/components/ui";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { formatDay } from "@/utils/dayFormatting";
import {
  MealPlanSelector,
  DayItem,
  CustomMealModal,
  RecommendationModal,
} from "@/components/meal";

const restrictedStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  } as ViewStyle,
  title: {
    fontSize: FONT.size.xl,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  } as TextStyle,
  message: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  } as TextStyle,
  featureList: {
    width: "100%",
    marginBottom: SPACING.xl,
  } as ViewStyle,
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  } as ViewStyle,
  featureText: {
    marginLeft: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
  } as TextStyle,
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  buttonText: {
    color: COLORS.white,
    fontSize: FONT.size.md,
    fontWeight: "bold",
  } as TextStyle,
});

const RestrictedAccess = () => {
  const router = useRouter();

  return (
    <View style={mealStyles.container}>
      <StatusBar style="dark" />
      <View style={restrictedStyles.content}>
        <Ionicons name="lock-closed" size={48} color={COLORS.primary} />

        <Text variant="h4" weight="bold" color="primary">
          Premium Feature
        </Text>
        <Text
          variant="body1"
          color="secondary"
          style={{
            textAlign: "center",
            marginBottom: SPACING.xl,
            lineHeight: 22,
          }}
        >
          Meal planning requires an active subscription or trial. Unlock all
          features to start your fitness journey!
        </Text>

        <View style={restrictedStyles.featureList}>
          {[
            "Personalized meal plans",
            "Nutrition tracking",
            "Meal recommendations",
          ].map((feature, index) => (
            <View key={index} style={restrictedStyles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
              <Text
                variant="body1"
                color="text"
                style={{ marginLeft: SPACING.sm }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={restrictedStyles.subscribeButton}
          onPress={() => router.push("/subscription/plans")}
        >
          <Text variant="body1" weight="bold" color="onPrimary">
            View Subscription Plans
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MealScreen() {
  const { isLoading, hasAccess, userData } = useSubscriptionCheck();
  const { user } = useUser();

  if (isLoading) {
    return (
      <View style={mealStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={mealStyles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (!hasAccess || !userData) {
    return <RestrictedAccess />;
  }

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
    handleAddCustomMeal,
    handleOpenRecommendations,
    handleCategoryFilter,
    handleSelectRecommendation,
    handleAddRecommendation,
    handleAddToTodaysFood,
    handleDeleteMeal,
    setModalVisible,
    setMealType,
    setMealName,
    setGrams,
    setRecommendModalVisible,
  } = useMealPlanner(userData._id, user);

  return (
    <View style={mealStyles.container}>
      <StatusBar style="dark" />
      <View style={mealStyles.header}>
        <Text
          variant="h2"
          weight="bold"
          color="onPrimary"
          style={mealStyles.headerTitle}
        >
          Meal Planner
        </Text>
        <Text variant="body1" color="onPrimary" style={{ opacity: 0.9 }}>
          Plan your meals for optimal nutrition
        </Text>
      </View>
      <MealPlanSelector
        selectedPlanType={selectedPlanType}
        onSelectWeightLoss={handleWeightLoss}
        onSelectWeightGain={handleWeightGain}
        onSelectMaintain={handleMaintainWeight}
      />
      <FlatList
        data={mealPlan}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mealStyles.listContainer}
        keyExtractor={(item) => item.day}
        renderItem={({ item, index }) => (
          <DayItem
            item={item}
            index={index}
            expandedDay={expandedDay}
            onToggleDay={toggleDayExpansion}
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
