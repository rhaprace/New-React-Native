import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  predictWeightChangeHall,
  calculateCalorieDeficitForWeightChange,
  getRealisticWeightChangeLimits,
  predictBodyCompositionChange
} from "../utils/metabolicCalculations";

// Constants for weight prediction - these are now dynamically calculated
// based on the user's current weight using the getRealisticWeightChangeLimits function
// but we keep this for backward compatibility
const WEIGHT_CHANGE_RATES = {
  // kg per week
  loss: {
    slow: -0.25,      // Slow weight loss: 0.25 kg per week
    moderate: -0.5,   // Moderate weight loss: 0.5 kg per week
    fast: -0.75,      // Fast weight loss: 0.75 kg per week
  },
  gain: {
    slow: 0.25,       // Slow weight gain: 0.25 kg per week
    moderate: 0.5,    // Moderate weight gain: 0.5 kg per week
    fast: 0.75,       // Fast weight gain: 0.75 kg per week
  },
  maintain: {
    default: 0,       // Maintain weight: 0 kg change
    fluctuation: 0.1, // Small fluctuations: ±0.1 kg
  }
};

// Predict weight based on goal category without requiring multiple weight entries
export const getPredictionByGoal = query({
  args: {
    userId: v.id("users"),
    daysToPredict: v.optional(v.number()),
    weightGoal: v.union(v.literal("loss"), v.literal("gain"), v.literal("maintain")),
    intensity: v.optional(v.union(v.literal("slow"), v.literal("moderate"), v.literal("fast"))),
  },
  handler: async (ctx, args) => {
    const { userId, daysToPredict = 90, weightGoal, intensity = "moderate" } = args;

    // Get user's profile
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || !profile.weight) {
      return {
        success: false,
        message: "No weight data available in profile",
        prediction: null,
      };
    }

    // Get the current weight
    const currentWeight = profile.weight;

    // Get realistic weight change limits based on current weight
    const { maxWeeklyLoss, maxWeeklyGain } = getRealisticWeightChangeLimits(currentWeight);

    // Determine the weekly rate of change based on goal and intensity
    // but constrained by realistic limits
    let weeklyRate = 0;
    if (weightGoal === "maintain") {
      weeklyRate = WEIGHT_CHANGE_RATES.maintain.default;
    } else if (weightGoal === "loss") {
      // For weight loss, use realistic limits
      const baseRate = WEIGHT_CHANGE_RATES.loss[intensity];
      weeklyRate = Math.max(baseRate, -maxWeeklyLoss); // Ensure we don't exceed safe weight loss rate
    } else { // gain
      // For weight gain, use realistic limits
      const baseRate = WEIGHT_CHANGE_RATES.gain[intensity];
      weeklyRate = Math.min(baseRate, maxWeeklyGain); // Ensure we don't exceed reasonable weight gain rate
    }

    // Convert to daily rate
    const dailyRate = weeklyRate / 7;

    // Calculate daily calorie deficit/surplus needed for this rate of change
    const dailyCalorieChange = calculateCalorieDeficitForWeightChange(
      currentWeight,
      weeklyRate * (daysToPredict / 7), // Total weight change over the prediction period
      daysToPredict
    );

    // Generate prediction dates
    const dates = [];
    for (let i = 1; i <= daysToPredict; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Generate predictions using the Hall model for more accurate weight change
    const predictedWeights = predictWeightChangeHall(
      currentWeight,
      dailyCalorieChange,
      daysToPredict
    );

    // Calculate target weight after the prediction period
    const targetWeight = predictedWeights[predictedWeights.length - 1];

    // Estimate body composition changes (assuming 20% body fat for men, 25% for women if not known)
    const estimatedBodyFat = profile.gender === "Male" ? 20 : 25;
    const bodyCompositionChange = predictBodyCompositionChange(
      currentWeight,
      estimatedBodyFat,
      targetWeight - currentWeight
    );

    // Calculate expected timeline to reach significant milestones
    let milestones: Array<{ description: string; days: number; weight: string }> = [];

    if (weightGoal === "loss") {
      // For weight loss, calculate when they'll lose 5%, 10%, 15% of current weight
      const fivePercent = currentWeight * 0.95;
      const tenPercent = currentWeight * 0.9;
      const fifteenPercent = currentWeight * 0.85;

      const daysToFivePercent = Math.ceil((fivePercent - currentWeight) / dailyRate);
      const daysToTenPercent = Math.ceil((tenPercent - currentWeight) / dailyRate);
      const daysToFifteenPercent = Math.ceil((fifteenPercent - currentWeight) / dailyRate);

      milestones = [
        { description: "5% weight loss", days: daysToFivePercent, weight: fivePercent.toFixed(1) },
        { description: "10% weight loss", days: daysToTenPercent, weight: tenPercent.toFixed(1) },
        { description: "15% weight loss", days: daysToFifteenPercent, weight: fifteenPercent.toFixed(1) },
      ].filter(m => m.days > 0 && m.days <= daysToPredict);
    } else if (weightGoal === "gain") {
      // For weight gain, calculate when they'll gain 5%, 10%, 15% of current weight
      const fivePercent = currentWeight * 1.05;
      const tenPercent = currentWeight * 1.1;
      const fifteenPercent = currentWeight * 1.15;

      const daysToFivePercent = Math.ceil((fivePercent - currentWeight) / dailyRate);
      const daysToTenPercent = Math.ceil((tenPercent - currentWeight) / dailyRate);
      const daysToFifteenPercent = Math.ceil((fifteenPercent - currentWeight) / dailyRate);

      milestones = [
        { description: "5% weight gain", days: daysToFivePercent, weight: fivePercent.toFixed(1) },
        { description: "10% weight gain", days: daysToTenPercent, weight: tenPercent.toFixed(1) },
        { description: "15% weight gain", days: daysToFifteenPercent, weight: fifteenPercent.toFixed(1) },
      ].filter(m => m.days > 0 && m.days <= daysToPredict);
    }

    // Get recommended meal plan and exercise info
    const mealPlanType = weightGoal === "loss" ? "weightLoss" :
                         weightGoal === "gain" ? "weightGain" : "maintenance";

    // Calculate expected calorie needs
    let recommendedCalories = profile.dailyCalories || 2000;
    if (weightGoal === "loss") {
      // For weight loss, reduce calories by 15-25% depending on intensity
      const reductionFactor = intensity === "slow" ? 0.15 :
                             intensity === "moderate" ? 0.2 : 0.25;
      recommendedCalories = Math.round(recommendedCalories * (1 - reductionFactor));
    } else if (weightGoal === "gain") {
      // For weight gain, increase calories by 15-25% depending on intensity
      const increaseFactor = intensity === "slow" ? 0.15 :
                            intensity === "moderate" ? 0.2 : 0.25;
      recommendedCalories = Math.round(recommendedCalories * (1 + increaseFactor));
    }

    // Calculate expected protein needs (in grams)
    // Higher for weight gain, moderate for maintenance, lower for weight loss
    const weightInKg = currentWeight;
    let proteinMultiplier = 1.6; // Default: 1.6g per kg of body weight

    if (weightGoal === "gain") {
      proteinMultiplier = 2.0; // Higher protein for muscle gain: 2.0g per kg
    } else if (weightGoal === "loss") {
      proteinMultiplier = 1.8; // Moderate-high protein for weight loss: 1.8g per kg
    }

    const recommendedProtein = Math.round(weightInKg * proteinMultiplier);

    // Exercise recommendations
    const exerciseRecommendations = {
      loss: {
        cardioMinutesPerWeek: intensity === "slow" ? 150 :
                             intensity === "moderate" ? 200 : 250,
        strengthTrainingPerWeek: 2,
        stepsPerDay: 8000,
      },
      gain: {
        cardioMinutesPerWeek: intensity === "slow" ? 90 :
                             intensity === "moderate" ? 120 : 150,
        strengthTrainingPerWeek: 4,
        stepsPerDay: 6000,
      },
      maintain: {
        cardioMinutesPerWeek: 150,
        strengthTrainingPerWeek: 3,
        stepsPerDay: 7000,
      }
    };

    return {
      success: true,
      currentWeight,
      targetWeight,
      prediction: {
        weightGoal,
        intensity,
        dailyRate,
        weeklyRate,
        predictedWeights,
        dates,
        milestones,
        bodyComposition: {
          initialBodyFat: estimatedBodyFat,
          finalBodyFat: bodyCompositionChange.newBodyFatPercentage,
          fatMassChange: bodyCompositionChange.fatMassChange,
          leanMassChange: bodyCompositionChange.leanMassChange
        },
        calorieDeficit: Math.abs(dailyCalorieChange),
        recommendations: {
          calories: recommendedCalories,
          protein: recommendedProtein,
          exercise: exerciseRecommendations[weightGoal],
          mealPlanType,
        }
      },
    };
  },
});

// Calculate weight prediction based on profile data
export const getWeightPrediction = query({
  args: {
    userId: v.id("users"),
    daysToPredict: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, daysToPredict = 90 } = args; // Predict for 90 days by default

    // Get user's profile with weight goal and activity data
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || !profile.weight) {
      return {
        success: false,
        message: "No weight data available",
        prediction: null,
      };
    }

    // Since we no longer have weight history, we'll use the profile data
    // and calorie/exercise data to make predictions
    const currentWeight = profile.weight;

    // Get calorie data to enhance prediction
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Get calorie tracking data
    const calorieData = await ctx.db
      .query("calorieGoalTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), thirtyDaysAgoStr))
      .collect();

    // Get exercise data
    const exerciseData = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), thirtyDaysAgoStr),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect();

    // Calculate average daily calorie deficit/surplus
    let avgCalorieDeficit = 0;
    if (calorieData.length > 0) {
      // Group exercise by date
      const exerciseByDate = exerciseData.reduce<Record<string, number>>((acc, exercise) => {
        if (!acc[exercise.date]) {
          acc[exercise.date] = 0;
        }
        acc[exercise.date] += exercise.caloriesBurned;
        return acc;
      }, {});

      // Calculate daily calorie deficit/surplus
      const dailyDeficits = calorieData.map(day => {
        const caloriesConsumed = day.totalCalories;
        const caloriesBurned = profile.bmr || 1800; // Base metabolic rate
        const exerciseCalories = exerciseByDate[day.date] || 0;

        // Deficit = calories burned (BMR + exercise) - calories consumed
        return (caloriesBurned + exerciseCalories) - caloriesConsumed;
      });

      // Calculate average deficit
      avgCalorieDeficit = dailyDeficits.reduce((sum, deficit) => sum + deficit, 0) / dailyDeficits.length;
    }

    // Determine trend based on calorie deficit/surplus using the Hall model
    // which accounts for metabolic adaptation
    const dailyCalorieDeficit = avgCalorieDeficit;

    // Generate prediction dates
    const dates = [];
    for (let i = 1; i <= daysToPredict; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Use the Hall model for more accurate predictions that account for metabolic adaptation
    let trendPrediction;
    let optimisticPrediction;
    let conservativePrediction;

    if (dailyCalorieDeficit !== 0) {
      // Current trend prediction using the Hall model
      trendPrediction = predictWeightChangeHall(
        currentWeight,
        dailyCalorieDeficit,
        daysToPredict
      );

      // Optimistic prediction (20% better deficit/surplus)
      optimisticPrediction = predictWeightChangeHall(
        currentWeight,
        dailyCalorieDeficit * 1.2,
        daysToPredict
      );

      // Conservative prediction (20% worse deficit/surplus)
      conservativePrediction = predictWeightChangeHall(
        currentWeight,
        dailyCalorieDeficit * 0.8,
        daysToPredict
      );
    } else {
      // If no calorie data, use maintenance prediction
      trendPrediction = dates.map(() => currentWeight);

      // Slight variations for optimistic/conservative when no data
      optimisticPrediction = dates.map((_, i) =>
        parseFloat((currentWeight - (0.05 * (i + 1) / 30)).toFixed(1))
      );

      conservativePrediction = dates.map((_, i) =>
        parseFloat((currentWeight + (0.05 * (i + 1) / 30)).toFixed(1))
      );
    }

    // Estimate body composition changes
    const estimatedBodyFat = profile.gender === "Male" ? 20 : 25;
    const weightChange = trendPrediction[trendPrediction.length - 1] - currentWeight;

    const bodyCompositionChange = predictBodyCompositionChange(
      currentWeight,
      estimatedBodyFat,
      weightChange
    );

    return {
      success: true,
      currentWeight,
      prediction: {
        calorieDeficit: dailyCalorieDeficit,
        predictedWeights: trendPrediction,
        optimisticWeights: optimisticPrediction,
        conservativeWeights: conservativePrediction,
        dates,
        dataPoints: calorieData.length, // Number of calorie data points used
        calorieDataAvailable: calorieData.length > 0,
        exerciseDataAvailable: exerciseData.length > 0,
        bodyComposition: {
          initialBodyFat: estimatedBodyFat,
          finalBodyFat: bodyCompositionChange.newBodyFatPercentage,
          fatMassChange: bodyCompositionChange.fatMassChange,
          leanMassChange: bodyCompositionChange.leanMassChange
        }
      },
    };
  },
});
