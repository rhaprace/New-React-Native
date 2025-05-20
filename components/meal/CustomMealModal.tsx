import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { BaseModal, FormInput, SelectionPills, Text } from "@/components/ui";
import { SPACING } from "@/constants/theme";
import { styles } from "@/styles/meal.style";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDay } from "@/utils/dayFormatting";
import { findExactMatch } from "@/utils/searchUtils";

interface CustomMealModalProps {
  visible: boolean;
  selectedDay: string | null;
  mealType: string;
  mealName: string;
  grams: string;
  loading: boolean;
  onClose: () => void;
  onChangeMealName: (text: string) => void;
  onChangeGrams: (text: string) => void;
  onSelectMealType: (type: string | null) => void;
  onAddCustomMeal: () => void;
}

const CustomMealModal: React.FC<CustomMealModalProps> = ({
  visible,
  selectedDay,
  mealType,
  mealName,
  grams,
  loading,
  onClose,
  onChangeMealName,
  onChangeGrams,
  onSelectMealType,
  onAddCustomMeal,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeoutRef = useRef<number | null>(null);

  // Query for matching food items with debounced search term
  const matchingFoods = useQuery(
    api.getFoodMacros.searchFoodMacrosByName,
    isSearching && searchTerm.trim().length >= 2
      ? {
          searchTerm: searchTerm,
        }
      : "skip"
  );

  // Debounce search to prevent UI glitches
  const debouncedSearch = useCallback((text: string) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(text);
      setIsSearching(text.trim().length >= 2);
    }, 300); // 300ms debounce delay
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle meal name change with debounced search
  const handleMealNameChange = (text: string) => {
    onChangeMealName(text);
    debouncedSearch(text);
  };

  // Auto-populate grams when we have an exact match
  useEffect(() => {
    if (matchingFoods && matchingFoods.length > 0) {
      const exactMatch = findExactMatch(matchingFoods, mealName, "name");
      if (exactMatch && !grams) {
        // Default to 100g if no grams specified
        onChangeGrams("100");
      }
    }
  }, [matchingFoods, mealName, grams, onChangeGrams]);

  // Handle selecting a food from the search results
  const handleSelectFood = (food: any) => {
    onChangeMealName(food.name);
    setSearchTerm(food.name);
    if (!grams) {
      onChangeGrams("100");
    }
  };

  const mealTypeOptions = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
  ];

  const modalTitle = `Add a Custom Meal for ${selectedDay ? formatDay(selectedDay) : ""}`;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={modalTitle}
      primaryAction={{
        label: loading
          ? "Adding..."
          : mealType
            ? `Add to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`
            : "Select a meal type",
        onPress: onAddCustomMeal,
        loading: loading,
        disabled: loading || !mealType || !mealName,
      }}
      secondaryAction={{
        label: "Close",
        onPress: onClose,
      }}
    >
      <SelectionPills
        label="Select Meal Type"
        options={mealTypeOptions}
        selectedValue={mealType}
        onSelect={onSelectMealType}
      />

      <FormInput
        label="Meal Name"
        value={mealName}
        onChangeText={handleMealNameChange}
        placeholder="e.g., Chicken Breast"
      />

      {/* Fixed height container for search results to prevent layout shifts */}
      <View
        style={[
          styles.searchResultsContainer,
          { minHeight: searchTerm.trim().length >= 2 ? 150 : 0 },
        ]}
      >
        {searchTerm.trim().length >= 2 && matchingFoods ? (
          matchingFoods.length > 0 ? (
            <>
              <Text
                variant="body2"
                color="secondary"
                style={{ marginBottom: SPACING.xs }}
              >
                <Text weight="semibold">{matchingFoods.length}</Text> matching
                food(s) found
              </Text>
              <ScrollView
                style={styles.searchResults}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {matchingFoods.slice(0, 5).map((food, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectFood(food)}
                  >
                    <Text variant="body2" weight="semibold">
                      {food.name}
                    </Text>
                    <Text variant="caption" color="secondary">
                      <Text weight="semibold">{food.calories}</Text> cal |{" "}
                      <Text weight="semibold">P: {food.protein}g</Text> |{" "}
                      <Text weight="semibold">C: {food.carbs}g</Text> |{" "}
                      <Text weight="semibold">F: {food.fat}g</Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : searchTerm.trim().length >= 2 ? (
            <Text variant="body2" color="secondary">
              No matching foods found. Try a different search term.
            </Text>
          ) : null
        ) : null}
      </View>

      <FormInput
        label="Grams"
        value={grams}
        onChangeText={onChangeGrams}
        placeholder="e.g., 150"
        keyboardType="numeric"
      />
    </BaseModal>
  );
};

export default CustomMealModal;
