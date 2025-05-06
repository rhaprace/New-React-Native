// Exercise calorie calculation constants
// These are approximate calories burned per minute based on exercise type
export const CALORIES_PER_MINUTE = {
  cardio: 10, // ~600 calories per hour
  strength: 7, // ~420 calories per hour
  flexibility: 4, // ~240 calories per hour
  core: 6, // ~360 calories per hour
  rest: 1, // ~60 calories per hour (resting metabolic rate)
  default: 5 // ~300 calories per hour (default)
};

/**
 * Calculate calories burned based on exercise type and duration
 * @param type Exercise type (cardio, strength, flexibility, core)
 * @param duration Duration in minutes
 * @returns Calories burned
 */
export const calculateCaloriesBurned = (type: string, duration: number): number => {
  const lowerType = type.toLowerCase();
  const caloriesPerMinute = CALORIES_PER_MINUTE[lowerType as keyof typeof CALORIES_PER_MINUTE] || CALORIES_PER_MINUTE.default;
  return Math.round(caloriesPerMinute * duration);
};

/**
 * Check if an exercise is likely from seed data
 * This is a heuristic based on common seed exercise names
 * @param exerciseName The name of the exercise
 * @returns True if the exercise is likely from seed data
 */
export const isLikelySeedExercise = (exerciseName: string): boolean => {
  const seedExerciseNames = [
    "Running", "Cycling", "Swimming", "Jumping Rope", "Elliptical",
    "Bench Press", "Squats", "Deadlifts", "Pull-ups", "Push-ups",
    "Yoga", "Stretching", "Pilates",
    "Plank", "Sit-ups", "Russian Twists", "Leg Raises",
    "Rest Day"
  ];
  
  return seedExerciseNames.some(name => 
    exerciseName.toLowerCase() === name.toLowerCase()
  );
};
