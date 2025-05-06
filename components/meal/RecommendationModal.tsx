import React from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseModal, SelectionPills, Text } from "@/components/ui";
import { COLORS, SPACING } from "@/constants/theme";
import { styles } from "@/styles/meal.style";
import { RumbleFood, getCategoryColor } from "@/constants/rumbleFoods";
import { formatDay } from "@/utils/dayFormatting";

interface RecommendationModalProps {
  visible: boolean;
  selectedDay: string | null;
  mealType: string;
  selectedPlanType: string;
  recommendations: RumbleFood[];
  selectedRecommendation: RumbleFood | null;
  selectedCategory: string | null;
  loading: boolean;
  onClose: () => void;
  onCategoryFilter: (category: string | null) => void;
  onSelectRecommendation: (food: RumbleFood) => void;
  onAddRecommendation: () => void;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  visible,
  selectedDay,
  mealType,
  selectedPlanType,
  recommendations,
  selectedRecommendation,
  selectedCategory,
  loading,
  onClose,
  onCategoryFilter,
  onSelectRecommendation,
  onAddRecommendation,
}) => {
  const modalTitle = `Recommended ${mealType} for ${selectedDay ? formatDay(selectedDay) : ""}`;

  const categoryOptions = [
    { value: null, label: "All" },
    { value: "protein", label: "Protein" },
    { value: "carb", label: "Carbs" },
    { value: "fat", label: "Fats" },
    { value: "vegetable", label: "Vegetables" },
    { value: "fruit", label: "Fruits" },
    { value: "snack", label: "Snacks" },
  ];

  const goalTypeText =
    selectedPlanType === "weightLoss"
      ? "weight loss"
      : selectedPlanType === "weightGain"
        ? "weight gain"
        : "maintenance";

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={modalTitle}
      showCloseIcon={true}
      primaryAction={{
        label: loading ? "Adding..." : `Add to ${mealType}`,
        onPress: onAddRecommendation,
        loading: loading,
        disabled: !selectedRecommendation || loading,
      }}
      secondaryAction={{
        label: "Close",
        onPress: onClose,
      }}
    >
      <Text
        variant="body2"
        color="secondary"
        style={{ marginBottom: SPACING.md }}
      >
        {mealType} recommendations based on your {goalTypeText} goal
      </Text>

      <SelectionPills
        options={categoryOptions}
        selectedValue={selectedCategory}
        onSelect={(value) => onCategoryFilter(value)}
        containerStyle={styles.filterContainer}
        pillStyle={styles.filterPill}
        selectedPillStyle={styles.filterPillSelected}
      />

      {recommendations.length > 0 ? (
        <FlatList
          data={recommendations}
          style={styles.recommendationsList}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.recommendationItem,
                selectedRecommendation?.id === item.id &&
                  styles.recommendationItemSelected,
              ]}
              onPress={() => onSelectRecommendation(item)}
            >
              <View
                style={[
                  styles.categoryIndicator,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              />
              <View style={styles.recommendationContent}>
                <Text
                  variant="body1"
                  weight="semibold"
                  style={{ marginBottom: SPACING.xs }}
                >
                  {item.name}
                </Text>
                <Text
                  variant="body2"
                  color="secondary"
                  style={{ marginBottom: SPACING.xs }}
                >
                  {item.description}
                </Text>
                <View style={styles.recommendationMacros}>
                  <View style={styles.macroPill}>
                    <Text variant="caption" color="secondary">
                      {item.calories} cal
                    </Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text variant="caption" color="secondary">
                      {item.protein}g protein
                    </Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text variant="caption" color="secondary">
                      {item.carbs}g carbs
                    </Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text variant="caption" color="secondary">
                      {item.fat}g fat
                    </Text>
                  </View>
                </View>
              </View>
              {selectedRecommendation?.id === item.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noRecommendations}>
          <Text
            variant="body1"
            color="secondary"
            style={{ textAlign: "center" }}
          >
            No recommendations available for the selected category.
          </Text>
        </View>
      )}
    </BaseModal>
  );
};

export default RecommendationModal;
