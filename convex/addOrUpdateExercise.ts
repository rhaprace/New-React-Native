import { mutation } from "./_generated/server";
import { v } from "convex/values";

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

    // First, handle the exercise record
    const existingExercise = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) =>
        q.eq("userId", userId).eq("day", day).eq("date", date)
      )
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    let exerciseResult;

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
      };
    } else {
      const newExerciseId = await ctx.db.insert("exercise", {
        userId,
        name,
        type,
        duration,
        caloriesBurned,
        day,
        date,
        isCompleted,
      });
      exerciseResult = {
        status: "created",
        exerciseId: newExerciseId,
      };
    }

    // Always update the recent workouts table when an exercise is completed
    if (isCompleted) {
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
        });
      }
    }

    return exerciseResult;
  },
});
