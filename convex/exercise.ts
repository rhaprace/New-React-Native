import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getExercisesByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, date, includeCompleted = false } = args;

    // Get exercises from the exercise table (seeded exercises)
    let exerciseQuery = ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), date));

    if (!includeCompleted) {
      // Make sure to filter out completed exercises
      exerciseQuery = exerciseQuery.filter((q) =>
        q.eq(q.field("isCompleted"), false)
      );
    }

    const exercisesFromExerciseTable = await exerciseQuery.collect();

    // Get exercises from the recentWorkouts table for the same date
    // This includes both custom exercises and completed seeded exercises
    let recentWorkoutsQuery = ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), date));

    // If we're not including completed exercises, filter them out
    if (!includeCompleted) {
      recentWorkoutsQuery = recentWorkoutsQuery.filter((q) =>
        // Filter by isCompleted field - only show exercises that are explicitly NOT completed
        q.eq(q.field("isCompleted"), false)
      );
    }

    // Get exercises from recentWorkouts table
    const exercisesFromRecentWorkouts = await recentWorkoutsQuery.collect();

    // Convert recentWorkouts to the same format as exercises
    const formattedRecentWorkouts = exercisesFromRecentWorkouts.map(
      (workout) => ({
        _id: workout._id,
        userId: workout.userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        day: workout.day,
        date: workout.date,
        // Use the isCompleted flag from the workout, defaulting to false if it doesn't exist
        isCompleted: workout.isCompleted ?? false,
        _creationTime: workout._creationTime,
        source: "recentWorkouts", // Add source for debugging
      })
    );

    // Add source to exercise table entries for debugging
    const formattedExercises = exercisesFromExerciseTable.map((exercise) => ({
      ...exercise,
      source: "exercise",
    }));

    // Combine both lists, but avoid duplicates by name
    // If an exercise exists in both tables, prioritize the one from the exercise table
    const exerciseNames = new Set(formattedExercises.map((e) => e.name));

    // Filter out any recentWorkouts that have the same name as exercises in the exercise table
    const uniqueRecentWorkouts = formattedRecentWorkouts.filter(
      (workout) => !exerciseNames.has(workout.name)
    );

    // Return the combined list
    return [...formattedExercises, ...uniqueRecentWorkouts];
  },
});
export const getRecentExercises = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 5, days = 30 } = args;
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    const startDate = pastDate.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];
    const exercises = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect();
    const seedExerciseNames = [
      "Running",
      "Cycling",
      "Swimming",
      "Jumping Rope",
      "Elliptical",
      "Bench Press",
      "Squats",
      "Deadlifts",
      "Pull-ups",
      "Push-ups",
      "Yoga",
      "Stretching",
      "Pilates",
      "Plank",
      "Sit-ups",
      "Russian Twists",
      "Leg Raises",
      "Rest Day",
    ];

    const userAddedExercises = exercises.filter((exercise) => {
      const normalizedName = exercise.name.toLowerCase().trim();
      return !seedExerciseNames.some(
        (name) => normalizedName === name.toLowerCase().trim()
      );
    });
    return userAddedExercises
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
});
export const getExerciseHistoryByDateRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, startDate, endDate } = args;
    const exercises = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect();
    const seedExerciseNames = [
      "Running",
      "Cycling",
      "Swimming",
      "Jumping Rope",
      "Elliptical",
      "Bench Press",
      "Squats",
      "Deadlifts",
      "Pull-ups",
      "Push-ups",
      "Yoga",
      "Stretching",
      "Pilates",
      "Plank",
      "Sit-ups",
      "Russian Twists",
      "Leg Raises",
      "Rest Day",
    ];
    const userAddedExercises = exercises.filter((exercise) => {
      const normalizedName = exercise.name.toLowerCase().trim();
      return !seedExerciseNames.some(
        (name) => normalizedName === name.toLowerCase().trim()
      );
    });
    interface DailyExerciseSummary {
      date: string;
      totalCaloriesBurned: number;
      totalDuration: number;
      exerciseCount: number;
      exercises: any[];
    }

    const exercisesByDate: Record<string, DailyExerciseSummary> = {};
    for (const exercise of userAddedExercises) {
      const { date } = exercise;

      if (!exercisesByDate[date]) {
        exercisesByDate[date] = {
          date,
          totalCaloriesBurned: 0,
          totalDuration: 0,
          exerciseCount: 0,
          exercises: [],
        };
      }

      exercisesByDate[date].totalCaloriesBurned += exercise.caloriesBurned;
      exercisesByDate[date].totalDuration += exercise.duration;
      exercisesByDate[date].exerciseCount += 1;
      exercisesByDate[date].exercises.push(exercise);
    }
    return Object.values(exercisesByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },
});
export const searchExercisesByName = query({
  args: {
    name: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { name, userId } = args;
    const normalizedName = name.toLowerCase().trim();
    if (normalizedName.length < 2) {
      return [];
    }

    // Get all exercises for this user
    let allExercises = [];
    if (userId) {
      // Get all exercises for this user (both completed and uncompleted)
      const exercisesFromExerciseTable = await ctx.db
        .query("exercise")
        .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
        .collect();

      // Also get exercises from recentWorkouts table
      const exercisesFromRecentWorkouts = await ctx.db
        .query("recentWorkouts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      // Convert recentWorkouts to the same format as exercises
      const formattedRecentWorkouts = exercisesFromRecentWorkouts.map(
        (workout) => ({
          _id: workout._id,
          userId: workout.userId,
          name: workout.name,
          type: workout.type,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          day: workout.day,
          date: workout.date,
          isCompleted: workout.isCompleted ?? false, // Use the existing isCompleted flag
          _creationTime: workout._creationTime,
          source: "recentWorkouts", // Add source for debugging
        })
      );

      // Combine both lists
      allExercises = [
        ...exercisesFromExerciseTable,
        ...formattedRecentWorkouts,
      ];
    } else {
      // Get exercises from both tables
      const exercisesFromExerciseTable = await ctx.db
        .query("exercise")
        .collect();
      const exercisesFromRecentWorkouts = await ctx.db
        .query("recentWorkouts")
        .collect();

      // Convert recentWorkouts to the same format as exercises
      const formattedRecentWorkouts = exercisesFromRecentWorkouts.map(
        (workout) => ({
          _id: workout._id,
          userId: workout.userId,
          name: workout.name,
          type: workout.type,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          day: workout.day,
          date: workout.date,
          isCompleted: workout.isCompleted ?? false, // Use the existing isCompleted flag
          _creationTime: workout._creationTime,
          source: "recentWorkouts", // Add source for debugging
        })
      );

      // Combine both lists
      allExercises = [
        ...exercisesFromExerciseTable,
        ...formattedRecentWorkouts,
      ];
    }

    // Create a map to store unique exercises by name
    const uniqueExerciseMap = new Map();

    // First pass: Group exercises by name (case-insensitive)
    for (const exercise of allExercises) {
      const key = exercise.name.toLowerCase().trim();

      if (!uniqueExerciseMap.has(key)) {
        uniqueExerciseMap.set(key, []);
      }

      uniqueExerciseMap.get(key).push(exercise);
    }

    // Second pass: For each group, keep only the most recent exercise
    const uniqueExercises = [];
    for (const [_, exercises] of uniqueExerciseMap.entries()) {
      if (exercises.length > 0) {
        // Sort by date (newest first) and take the first one
        const sortedExercises = exercises.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        uniqueExercises.push(sortedExercises[0]);
      }
    }

    // Create a regex pattern for more flexible matching
    // This will match variations like "push-ups", "pushups", "push ups", etc.
    const createSearchRegex = (searchTerm: string) => {
      // Remove special characters and convert to lowercase
      const cleanTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Create a pattern that allows for variations in spacing and hyphens
      // For example, "pushups" can match "push-ups" or "push ups"
      let pattern = "";
      for (let i = 0; i < cleanTerm.length; i++) {
        pattern += cleanTerm[i];
        if (i < cleanTerm.length - 1) {
          pattern += "[\\s\\-]*"; // Allow optional spaces or hyphens between characters
        }
      }
      return new RegExp(pattern, "i"); // Case insensitive
    };

    const searchRegex = createSearchRegex(normalizedName);

    // Filter the unique exercises using the regex pattern
    const matchingExercises = uniqueExercises.filter((exercise) => {
      // Direct regex match
      if (searchRegex.test(exercise.name)) {
        return true;
      }

      // Direct substring match (fallback)
      if (exercise.name.toLowerCase().includes(normalizedName)) {
        return true;
      }

      // Simplified alphanumeric match (remove special characters)
      const normalizedExName = exercise.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const simplifiedSearchName = normalizedName.replace(/[^a-z0-9]/g, "");

      return (
        normalizedExName.includes(simplifiedSearchName) ||
        simplifiedSearchName.includes(normalizedExName)
      );
    });

    return matchingExercises;
  },
});
export const resetCompletedExercises = mutation({
  args: {
    userId: v.id("users"),
    previousDate: v.string(),
    newDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, previousDate, newDate } = args;

    // Get completed exercises from both tables
    const completedExercisesFromExerciseTable = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("date"), previousDate),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect();

    // Get exercises from recentWorkouts for the same date
    const completedExercisesFromRecentWorkouts = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), previousDate))
      .collect();

    const newDay = new Date(newDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const newWorkoutIds = [];

    // Process exercises from the exercise table - only if they're seeded exercises
    for (const exercise of completedExercisesFromExerciseTable) {
      // Add to recentWorkouts table instead of exercise table
      const newWorkoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name: exercise.name,
        type: exercise.type,
        duration: exercise.duration,
        caloriesBurned: exercise.caloriesBurned,
        day: newDay,
        date: newDate,
        lastUsed: new Date().toISOString(),
        isCompleted: false, // Mark as not completed so it shows up in Today's Exercises
      });

      newWorkoutIds.push(newWorkoutId);
    }

    // Process exercises from the recentWorkouts table
    for (const workout of completedExercisesFromRecentWorkouts) {
      // Add to recentWorkouts table
      const newWorkoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        day: newDay,
        date: newDate,
        lastUsed: new Date().toISOString(),
        isCompleted: false, // Mark as not completed so it shows up in Today's Exercises
      });

      newWorkoutIds.push(newWorkoutId);
    }

    return {
      success: true,
      message: `Reset ${newWorkoutIds.length} exercises for the new day`,
      workoutIds: newWorkoutIds,
    };
  },
});
