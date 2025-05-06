import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed recent workouts data for testing
export const seedRecentWorkouts = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    // Common exercise types
    const exerciseTypes = ["cardio", "strength", "flexibility", "core"];
    
    // Exercise names by type
    const exerciseNames = {
      cardio: ["Running", "Cycling", "Swimming", "Jumping Rope", "Elliptical"],
      strength: ["Bench Press", "Squats", "Deadlifts", "Pull-ups", "Push-ups"],
      flexibility: ["Yoga", "Stretching", "Pilates"],
      core: ["Plank", "Sit-ups", "Russian Twists", "Leg Raises"]
    };
    
    // Current date
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const day = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Create recent workouts
    const workoutIds = [];
    
    // Add one workout of each type
    for (const type of exerciseTypes) {
      const nameOptions = exerciseNames[type as keyof typeof exerciseNames];
      const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      
      // Random duration (10-60 minutes)
      const duration = Math.floor(Math.random() * 51) + 10;
      
      // Random calories burned (50-500)
      const caloriesBurned = Math.floor(Math.random() * 451) + 50;
      
      // Random lastUsed date within the last week
      const lastUsed = new Date();
      lastUsed.setDate(today.getDate() - Math.floor(Math.random() * 7));
      
      // Insert the recent workout
      const workoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name,
        type,
        duration,
        caloriesBurned,
        day,
        date,
        lastUsed: lastUsed.toISOString(),
      });
      
      workoutIds.push(workoutId);
    }
    
    // Add some custom workouts
    const customWorkouts = [
      {
        name: "Push-ups",
        type: "strength",
        duration: 15,
        caloriesBurned: 150,
      },
      {
        name: "Pull-ups",
        type: "strength",
        duration: 10,
        caloriesBurned: 100,
      },
      {
        name: "Burpees",
        type: "cardio",
        duration: 20,
        caloriesBurned: 200,
      },
      {
        name: "Mountain Climbers",
        type: "cardio",
        duration: 15,
        caloriesBurned: 150,
      },
      {
        name: "Lunges",
        type: "strength",
        duration: 15,
        caloriesBurned: 120,
      }
    ];
    
    for (const workout of customWorkouts) {
      // Random lastUsed date within the last 3 days
      const lastUsed = new Date();
      lastUsed.setDate(today.getDate() - Math.floor(Math.random() * 3));
      
      // Insert the custom workout
      const workoutId = await ctx.db.insert("recentWorkouts", {
        userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        day,
        date,
        lastUsed: lastUsed.toISOString(),
      });
      
      workoutIds.push(workoutId);
    }
    
    return {
      success: true,
      message: `Created ${workoutIds.length} recent workouts`,
      workoutIds,
    };
  },
});
