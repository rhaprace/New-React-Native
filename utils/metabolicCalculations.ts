/**
 * Utility functions for metabolic calculations
 * Contains various formulas for BMR, TDEE, and weight change predictions
 */

export type Gender = "Male" | "Female";
export type ActivityLevel = "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active";

// Activity multipliers for TDEE calculation
export const activityMultipliers: Record<ActivityLevel, number> = {
  "Sedentary": 1.2, // Little or no exercise
  "Light": 1.375, // Light exercise/sports 1-3 days/week
  "Moderate": 1.55, // Moderate exercise/sports 3-5 days/week
  "Active": 1.725, // Hard exercise/sports 6-7 days/week
  "Very Active": 1.9, // Very hard exercise, physical job or training twice a day
};

/**
 * Calculate BMR using the Mifflin-St Jeor Equation
 * This is considered the most accurate equation for the general population
 * @param weight Weight in kg
 * @param height Height in cm
 * @param age Age in years
 * @param gender Gender (Male or Female)
 * @returns BMR in calories per day
 */
export const calculateBMRMifflinStJeor = (
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number => {
  if (gender === "Male") {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

/**
 * Calculate BMR using the Cunningham Equation
 * This is more accurate for athletic individuals with higher muscle mass
 * Requires lean body mass (LBM) which can be estimated if not known
 * @param leanBodyMass Lean body mass in kg
 * @returns BMR in calories per day
 */
export const calculateBMRCunningham = (leanBodyMass: number): number => {
  return 500 + (22 * leanBodyMass);
};

/**
 * Estimate lean body mass using the Boer formula if body fat percentage is unknown
 * @param weight Weight in kg
 * @param height Height in cm
 * @param gender Gender (Male or Female)
 * @returns Estimated lean body mass in kg
 */
export const estimateLeanBodyMass = (
  weight: number,
  height: number,
  gender: Gender
): number => {
  if (gender === "Male") {
    return (0.407 * weight) + (0.267 * height) - 19.2;
  } else {
    return (0.252 * weight) + (0.473 * height) - 48.3;
  }
};

/**
 * Calculate lean body mass from weight and body fat percentage
 * @param weight Weight in kg
 * @param bodyFatPercentage Body fat percentage (0-100)
 * @returns Lean body mass in kg
 */
export const calculateLeanBodyMass = (
  weight: number,
  bodyFatPercentage: number
): number => {
  return weight * (1 - (bodyFatPercentage / 100));
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) based on BMR and activity level
 * @param bmr BMR in calories per day
 * @param activityLevel Activity level
 * @returns TDEE in calories per day
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: ActivityLevel
): number => {
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

/**
 * Calculate adaptive TDEE based on BMR, activity level, and exercise data
 * This provides a more accurate TDEE by incorporating actual exercise data
 * @param bmr BMR in calories per day
 * @param activityLevel Activity level
 * @param exerciseCalories Additional calories burned through exercise
 * @returns Adaptive TDEE in calories per day
 */
export const calculateAdaptiveTDEE = (
  bmr: number,
  activityLevel: ActivityLevel,
  exerciseCalories: number = 0
): number => {
  // Use a lower activity multiplier to avoid double-counting exercise
  const baseMultiplier = activityMultipliers[activityLevel];
  const adjustedMultiplier = baseMultiplier > 1.55 
    ? baseMultiplier - 0.2 // Reduce multiplier for active individuals
    : baseMultiplier - 0.1; // Reduce multiplier less for less active individuals
  
  // Calculate base TDEE with adjusted multiplier
  const baseTDEE = bmr * adjustedMultiplier;
  
  // Add exercise calories
  return Math.round(baseTDEE + exerciseCalories);
};

/**
 * Calculate calorie deficit/surplus needed for target weight change
 * Based on the 3,500 kcal ≈ 1 lb of fat (7,700 kcal ≈ 1 kg) rule of thumb,
 * but with adaptive adjustments based on the Hall model
 * @param currentWeight Current weight in kg
 * @param targetWeightChange Target weight change in kg (positive for gain, negative for loss)
 * @param timeframe Timeframe in days
 * @returns Required daily calorie deficit/surplus
 */
export const calculateCalorieDeficitForWeightChange = (
  currentWeight: number,
  targetWeightChange: number,
  timeframe: number
): number => {
  // Base calculation using the 7,700 kcal per kg rule
  const baseCaloriesNeeded = targetWeightChange * 7700;
  const baseDeficitPerDay = baseCaloriesNeeded / timeframe;
  
  // Apply adaptive adjustment based on the Hall model
  // As weight loss progresses, metabolic adaptation occurs
  // This factor increases the deficit needed as the weight change increases
  const adaptationFactor = 1 + (Math.abs(targetWeightChange) / currentWeight) * 0.3;
  
  return Math.round(baseDeficitPerDay * adaptationFactor);
};

/**
 * Calculate weight change over time using the Hall model
 * This model accounts for metabolic adaptation during weight loss/gain
 * @param currentWeight Current weight in kg
 * @param dailyCalorieDeficit Daily calorie deficit (negative) or surplus (positive)
 * @param days Number of days to predict
 * @returns Predicted weights for each day
 */
export const predictWeightChangeHall = (
  currentWeight: number,
  dailyCalorieDeficit: number,
  days: number
): number[] => {
  const predictedWeights: number[] = [currentWeight];
  let weight = currentWeight;
  
  // Constants for the Hall model
  const p = 0.1; // Proportion of energy imbalance going to body fat
  
  for (let day = 1; day <= days; day++) {
    // Calculate metabolic adaptation factor (decreases as weight changes)
    const weightChange = weight - currentWeight;
    const adaptationFactor = 1 - (Math.abs(weightChange) / currentWeight) * 0.2;
    
    // Adjusted daily deficit accounting for metabolic adaptation
    const adjustedDeficit = dailyCalorieDeficit * adaptationFactor;
    
    // Calculate weight change for the day
    // The Hall model suggests that the energy deficit required increases over time
    const dailyChange = adjustedDeficit / (7700 * (1 + day * p / 365));
    
    // Update weight
    weight += dailyChange;
    predictedWeights.push(parseFloat(weight.toFixed(1)));
  }
  
  // Remove the initial weight
  return predictedWeights.slice(1);
};

/**
 * Calculate body composition changes using the Forbes formula
 * This estimates how much of weight change is fat vs. lean mass
 * @param currentWeight Current weight in kg
 * @param currentBodyFat Current body fat percentage (0-100)
 * @param weightChange Weight change in kg (positive for gain, negative for loss)
 * @returns New body fat percentage and breakdown of fat/lean mass changes
 */
export const predictBodyCompositionChange = (
  currentWeight: number,
  currentBodyFat: number,
  weightChange: number
): {
  newBodyFatPercentage: number;
  fatMassChange: number;
  leanMassChange: number;
} => {
  // Convert body fat percentage to decimal
  const bf = currentBodyFat / 100;
  
  // Calculate current fat mass and lean mass
  const currentFatMass = currentWeight * bf;
  const currentLeanMass = currentWeight * (1 - bf);
  
  // Forbes formula coefficients
  const C = 10.4; // Forbes constant
  
  // Calculate proportion of weight change that is fat
  let fatProportion: number;
  
  if (weightChange < 0) {
    // Weight loss: higher proportion of fat loss for higher initial body fat
    fatProportion = Math.min(0.9, Math.max(0.7, bf + 0.2));
  } else {
    // Weight gain: lower proportion of fat gain for lower initial body fat
    fatProportion = Math.max(0.3, Math.min(0.7, bf));
  }
  
  // Calculate fat mass and lean mass changes
  const fatMassChange = weightChange * fatProportion;
  const leanMassChange = weightChange - fatMassChange;
  
  // Calculate new body composition
  const newFatMass = currentFatMass + fatMassChange;
  const newLeanMass = currentLeanMass + leanMassChange;
  const newWeight = currentWeight + weightChange;
  const newBodyFatPercentage = (newFatMass / newWeight) * 100;
  
  return {
    newBodyFatPercentage: parseFloat(newBodyFatPercentage.toFixed(1)),
    fatMassChange: parseFloat(fatMassChange.toFixed(1)),
    leanMassChange: parseFloat(leanMassChange.toFixed(1)),
  };
};

/**
 * Calculate realistic weight change limits based on current weight
 * @param currentWeight Current weight in kg
 * @returns Maximum recommended weekly weight change in kg
 */
export const getRealisticWeightChangeLimits = (
  currentWeight: number
): {
  maxWeeklyLoss: number;
  maxWeeklyGain: number;
} => {
  // Maximum recommended weight loss is 1% of body weight per week
  // but not more than 1 kg per week for safety
  const maxWeeklyLoss = Math.min(currentWeight * 0.01, 1.0);
  
  // Maximum recommended weight gain is 0.5% of body weight per week
  // but not more than 0.5 kg per week for quality muscle gain
  const maxWeeklyGain = Math.min(currentWeight * 0.005, 0.5);
  
  return {
    maxWeeklyLoss: parseFloat(maxWeeklyLoss.toFixed(2)),
    maxWeeklyGain: parseFloat(maxWeeklyGain.toFixed(2)),
  };
};
