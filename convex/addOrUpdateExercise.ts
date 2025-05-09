import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addExercise = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    caloriesBurned: v.number(),
    day: v.string(),
    date: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const {
      userId,
      name,
      type,
      duration,
      caloriesBurned,
      day,
      date,
      isCompleted,
    } = args;

    // Only add to recentWorkouts table, not to the exercise table
    // This ensures the exercise table only contains seeded exercises
    const now = new Date().toISOString();
    const newWorkoutId = await ctx.db.insert("recentWorkouts", {
      userId,
      name,
      type,
      duration,
      caloriesBurned,
      day,
      date,
      lastUsed: now,
      isCompleted: isCompleted, // Use the isCompleted flag from the args
    });

    return {
      status: "created",
      exerciseId: newWorkoutId, // Return the ID from recentWorkouts
    };
  },
});

export const upsertExercise = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    caloriesBurned: v.number(),
    day: v.string(),
    date: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const {
      userId,
      name,
      type,
      duration,
      caloriesBurned,
      day,
      date,
      isCompleted,
    } = args;

    // First, check if this is a seeded exercise in the exercise table
    const existingExercise = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) =>
        q.eq("userId", userId).eq("day", day).eq("date", date)
      )
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    // Also check if it exists in the recentWorkouts table
    const existingRecentWorkout = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", name))
      .filter((q) => q.eq(q.field("date"), date))
      .first();

    let exerciseResult;

    // If it exists in the exercise table (seeded exercise), update it there
    if (existingExercise) {
      await ctx.db.patch(existingExercise._id, {
        type,
        duration,
        caloriesBurned,
        isCompleted,
      });
      exerciseResult = {
        status: "updated",
        exerciseId: existingExercise._id,
        source: "exercise",
      };
    }
    // If it exists in recentWorkouts, update it there
    else if (existingRecentWorkout) {
      await ctx.db.patch(existingRecentWorkout._id, {
        type,
        duration,
        caloriesBurned,
        day,
        date,
        isCompleted,
        lastUsed: new Date().toISOString(),
      });
      exerciseResult = {
        status: "updated",
        exerciseId: existingRecentWorkout._id,
        source: "recentWorkouts",
      };
    }
    // If it doesn't exist in either table, add it to recentWorkouts
    else {
      const now = new Date().toISOString();
      const newWorkoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name,
        type,
        duration,
        caloriesBurned,
        day,
        date,
        lastUsed: now,
        isCompleted,
      });
      exerciseResult = {
        status: "created",
        exerciseId: newWorkoutId,
        source: "recentWorkouts",
      };
    }

    // If the exercise was completed and it's from the exercise table,
    // we need to make sure it's also in the recentWorkouts table for history
    if (isCompleted && exerciseResult.source === "exercise") {
      const now = new Date().toISOString();

      // Check if this workout already exists in recent workouts
      const existingRecentWorkout = await ctx.db
        .query("recentWorkouts")
        .withIndex("by_user_name", (q) =>
          q.eq("userId", userId).eq("name", name)
        )
        .first();

      if (existingRecentWorkout) {
        // Update the existing recent workout
        await ctx.db.patch(existingRecentWorkout._id, {
          type,
          duration,
          caloriesBurned,
          day,
          date,
          lastUsed: now,
          isCompleted: true, // Explicitly mark as completed
        });
      } else {
        // Create a new recent workout entry
        await ctx.db.insert("recentWorkouts", {
          userId,
          name,
          type,
          duration,
          caloriesBurned,
          day,
          date,
          lastUsed: now,
          isCompleted: true, // Explicitly mark as completed
        });
      }
    }

    return exerciseResult;
  },
});
