import React, { useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { COLORS, SLATE } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface ExerciseHistoryProps {
  exerciseHistory: Array<{
    date: string;
    totalCaloriesBurned: number;
    totalDuration: number;
    exerciseCount: number;
  }>;
  dailyExerciseGoal?: number;
}

const ExerciseHistoryChart: React.FC<ExerciseHistoryProps> = ({
  exerciseHistory,
  dailyExerciseGoal = 300,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week"
  );
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const maxBarHeight = 200;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  
  const getFilteredData = () => {
    const today = new Date();
    let startDate: Date;

    if (selectedPeriod === "week") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
    }

    return exerciseHistory.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= today;
    });
  };

  const filteredData = getFilteredData();
  const maxCaloriesBurned = Math.max(
    ...filteredData.map((item) => item.totalCaloriesBurned),
    dailyExerciseGoal
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="fitness" size={22} color={COLORS.success} />
          <Text variant="h5" weight="semibold" style={styles.title}>
            Exercise History
          </Text>
        </View>
        <View style={styles.periodSelector}>
          <Text
            variant="body2"
            weight={selectedPeriod === "week" ? "bold" : "regular"}
            color={selectedPeriod === "week" ? "success" : "secondary"}
            style={styles.periodOption}
            onPress={() => setSelectedPeriod("week")}
          >
            Week
          </Text>
          <Text
            variant="body2"
            weight={selectedPeriod === "month" ? "bold" : "regular"}
            color={selectedPeriod === "month" ? "success" : "secondary"}
            style={styles.periodOption}
            onPress={() => setSelectedPeriod("month")}
          >
            Month
          </Text>
        </View>
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="body1" color="secondary" style={styles.emptyText}>
            No exercise data available for this period
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}
        >
          <View
            style={[
              styles.goalLine,
              {
                top:
                  maxBarHeight -
                  (dailyExerciseGoal / maxCaloriesBurned) * maxBarHeight,
                width: Math.max(chartWidth, filteredData.length * 60),
              },
            ]}
          />
          {filteredData.map((item, index) => {
            const barHeight = (item.totalCaloriesBurned / maxCaloriesBurned) * maxBarHeight;
            const isOverGoal = item.totalCaloriesBurned > dailyExerciseGoal;

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barLabelContainer}>
                  <Text
                    variant="caption"
                    color="secondary"
                    style={styles.barValue}
                  >
                    {item.totalCaloriesBurned}
                  </Text>
                </View>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isOverGoal
                        ? COLORS.success
                        : COLORS.secondary,
                    },
                  ]}
                />
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.dateLabel}
                >
                  {formatDate(item.date)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.secondary }]}
          />
          <Text variant="caption" color="secondary">
            Below Goal
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.success }]}
          />
          <Text variant="caption" color="secondary">
            Reached Goal
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.goalLineSmall} />
          <Text variant="caption" color="secondary">
            Daily Goal ({dailyExerciseGoal} cal)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 8,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 4,
  },
  periodOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartContainer: {
    height: 250,
    alignItems: "flex-end",
    paddingRight: 16,
    paddingBottom: 20,
  },
  barContainer: {
    width: 50,
    alignItems: "center",
    marginHorizontal: 5,
  },
  barLabelContainer: {
    height: 20,
  },
  barValue: {
    fontSize: 10,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  goalLine: {
    position: "absolute",
    height: 2,
    backgroundColor: COLORS.error,
    left: 0,
    zIndex: 1,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  goalLineSmall: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.error,
    marginRight: 4,
  },
  emptyState: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});

export default ExerciseHistoryChart;
