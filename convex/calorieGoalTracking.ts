import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";
export const trackCalorieGoal = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    goalReached: v.boolean(),
    goalExceeded: v.boolean(),
    totalCalories: v.number(),
    dailyCalorieGoal: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, date, goalReached, goalExceeded, totalCalories, dailyCalorieGoal } = args;
    const existingTracking = await ctx.db
      .query("calorieGoalTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .first();
    
    const lastUpdated = new Date().toISOString();
    
    if (existingTracking) {
      await ctx.db.patch(existingTracking._id, {
        goalReached,
        goalExceeded,
        totalCalories,
        dailyCalorieGoal,
        lastUpdated,
      });
      
      return {
        success: true,
        trackingId: existingTracking._id,
        status: "updated",
      };
    } else {
      const trackingId = await ctx.db.insert("calorieGoalTracking", {
        userId,
        date,
        goalReached,
        goalExceeded,
        totalCalories,
        dailyCalorieGoal,
        lastUpdated,
      });
      
      return {
        success: true,
        trackingId,
        status: "created",
      };
    }
  },
});
export const getCalorieGoalTrackingByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, date } = args;
    
    return await ctx.db
      .query("calorieGoalTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .first();
  },
});
export const resetCalorieTracking = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, date } = args;
    const existingTracking = await ctx.db
      .query("calorieGoalTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .first();
    
    if (existingTracking) {
      await ctx.db.patch(existingTracking._id, {
        goalReached: false,
        goalExceeded: false,
        totalCalories: 0,
        lastUpdated: new Date().toISOString(),
      });
      
      return {
        success: true,
        status: "reset",
      };
    }
    
    return {
      success: false,
      status: "no_tracking_found",
    };
  },
});
