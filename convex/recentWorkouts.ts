import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get recent workouts for a user
export const getRecentWorkouts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 5 } = args;
    
    // Get recent workouts sorted by lastUsed (most recent first)
    const recentWorkouts = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_last_used", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    return recentWorkouts;
  },
});

// Add or update a recent workout
export const upsertRecentWorkout = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    caloriesBurned: v.number(),
    day: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, name, type, duration, caloriesBurned, day, date } = args;
    
    // Check if this workout already exists for this user
    const existingWorkout = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user_name", (q) => 
        q.eq("userId", userId)
         .eq("name", name)
      )
      .first();
    
    const now = new Date().toISOString();
    
    if (existingWorkout) {
      // Update the existing workout with new details and lastUsed timestamp
      await ctx.db.patch(existingWorkout._id, {
        type,
        duration,
        caloriesBurned,
        day,
        date,
        lastUsed: now,
      });
      
      return { 
        status: "updated", 
        workoutId: existingWorkout._id 
      };
    } 
    
    // Create a new recent workout entry
    const newWorkoutId = await ctx.db.insert("recentWorkouts", {
      userId,
      name,
      type,
      duration,
      caloriesBurned,
      day,
      date,
      lastUsed: now,
    });
    
    return { 
      status: "created", 
      workoutId: newWorkoutId 
    };
  },
});

// Search recent workouts by name
export const searchRecentWorkoutsByName = query({
  args: {
    userId: v.id("users"),
    name: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, name, limit = 5 } = args;
    const normalizedName = name.toLowerCase().trim();
    
    if (normalizedName.length < 2) {
      return [];
    }
    
    // Get all recent workouts for this user
    const allWorkouts = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Filter for matching names
    const matchingWorkouts = allWorkouts.filter((workout) => {
      const workoutName = workout.name.toLowerCase();
      
      // Direct substring match
      if (workoutName.includes(normalizedName)) {
        return true;
      }
      
      // Simplified alphanumeric match (remove special characters)
      const normalizedWorkoutName = workoutName.replace(/[^a-z0-9]/g, "");
      const simplifiedSearchName = normalizedName.replace(/[^a-z0-9]/g, "");
      
      return (
        normalizedWorkoutName.includes(simplifiedSearchName) ||
        simplifiedSearchName.includes(normalizedWorkoutName)
      );
    });
    
    // Sort by lastUsed (most recent first) and limit results
    return matchingWorkouts
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit);
  },
});

// Delete a recent workout
export const deleteRecentWorkout = mutation({
  args: {
    workoutId: v.id("recentWorkouts"),
  },
  handler: async (ctx, args) => {
    const { workoutId } = args;
    await ctx.db.delete(workoutId);
    return { success: true };
  },
});
