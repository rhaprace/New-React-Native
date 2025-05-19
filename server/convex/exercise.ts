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
    let exerciseQuery = ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), date));

    if (!includeCompleted) {
      exerciseQuery = exerciseQuery.filter((q) =>
        q.eq(q.field("isCompleted"), false)
      );
    }

    const exercisesFromExerciseTable = await exerciseQuery.collect();
    let recentWorkoutsQuery = ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), date));
    if (!includeCompleted) {
      recentWorkoutsQuery = recentWorkoutsQuery.filter((q) =>
        q.eq(q.field("isCompleted"), false)
      );
    }
    const exercisesFromRecentWorkouts = await recentWorkoutsQuery.collect();
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
        isCompleted: workout.isCompleted ?? false,
        _creationTime: workout._creationTime,
        source: "recentWorkouts",
      })
    );
    const formattedExercises = exercisesFromExerciseTable.map((exercise) => ({
      ...exercise,
      source: "exercise",
    }));
    const exerciseNames = new Set(formattedExercises.map((e) => e.name));
    const uniqueRecentWorkouts = formattedRecentWorkouts.filter(
      (workout) => !exerciseNames.has(workout.name)
    );
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
    let allExercises = [];
    if (userId) {
      const exercisesFromExerciseTable = await ctx.db
        .query("exercise")
        .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
        .collect();
      const exercisesFromRecentWorkouts = await ctx.db
        .query("recentWorkouts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
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
          isCompleted: workout.isCompleted ?? false,
          _creationTime: workout._creationTime,
          source: "recentWorkouts",
        })
      );
      allExercises = [
        ...exercisesFromExerciseTable,
        ...formattedRecentWorkouts,
      ];
    } else {
      const exercisesFromExerciseTable = await ctx.db
        .query("exercise")
        .collect();
      const exercisesFromRecentWorkouts = await ctx.db
        .query("recentWorkouts")
        .collect();
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
          isCompleted: workout.isCompleted ?? false,
          _creationTime: workout._creationTime,
          source: "recentWorkouts",
        })
      );
      allExercises = [
        ...exercisesFromExerciseTable,
        ...formattedRecentWorkouts,
      ];
    }
    const uniqueExerciseMap = new Map();
    for (const exercise of allExercises) {
      const key = exercise.name.toLowerCase().trim();

      if (!uniqueExerciseMap.has(key)) {
        uniqueExerciseMap.set(key, []);
      }

      uniqueExerciseMap.get(key).push(exercise);
    }
    const uniqueExercises = [];
    for (const [_, exercises] of uniqueExerciseMap.entries()) {
      if (exercises.length > 0) {
        const sortedExercises = exercises.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        uniqueExercises.push(sortedExercises[0]);
      }
    }
    const createSearchRegex = (searchTerm: string) => {
      const cleanTerm = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");
      let pattern = "";
      for (let i = 0; i < cleanTerm.length; i++) {
        pattern += cleanTerm[i];
        if (i < cleanTerm.length - 1) {
          pattern += "[\\s\\-]*";
        }
      }
      return new RegExp(pattern, "i");
    };

    const searchRegex = createSearchRegex(normalizedName);

    const matchingExercises = uniqueExercises.filter((exercise) => {
      if (searchRegex.test(exercise.name)) {
        return true;
      }
      if (exercise.name.toLowerCase().includes(normalizedName)) {
        return true;
      }
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
    const completedExercisesFromRecentWorkouts = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("date"), previousDate))
      .collect();

    const newDay = new Date(newDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const newWorkoutIds = [];
    for (const exercise of completedExercisesFromExerciseTable) {
      const newWorkoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name: exercise.name,
        type: exercise.type,
        duration: exercise.duration,
        caloriesBurned: exercise.caloriesBurned,
        day: newDay,
        date: newDate,
        lastUsed: new Date().toISOString(),
        isCompleted: false,
      });

      newWorkoutIds.push(newWorkoutId);
    }
    for (const workout of completedExercisesFromRecentWorkouts) {
      const newWorkoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        day: newDay,
        date: newDate,
        lastUsed: new Date().toISOString(),
        isCompleted: false,
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
