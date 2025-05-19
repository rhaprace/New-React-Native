import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed exercise data for testing
export const seedExerciseData = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    // Create dates for the past 30 days
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Exercise types
    const exerciseTypes = ["cardio", "strength", "flexibility", "core"];
    
    // Exercise names by type
    const exerciseNames = {
      cardio: ["Running", "Cycling", "Swimming", "Jumping Rope", "Elliptical"],
      strength: ["Bench Press", "Squats", "Deadlifts", "Pull-ups", "Push-ups"],
      flexibility: ["Yoga", "Stretching", "Pilates"],
      core: ["Plank", "Sit-ups", "Russian Twists", "Leg Raises"]
    };
    
    // Days of the week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Create random exercise data for each date
    const exerciseIds = [];
    
    for (const date of dates) {
      const dateObj = new Date(date);
      const day = daysOfWeek[dateObj.getDay()];
      
      // Random number of exercises for this day (0-3)
      const numExercises = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numExercises; i++) {
        // Random exercise type
        const type = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
        
        // Random exercise name from the selected type
        const nameOptions = exerciseNames[type as keyof typeof exerciseNames];
        const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
        
        // Random duration (10-60 minutes)
        const duration = Math.floor(Math.random() * 51) + 10;
        
        // Random calories burned (50-500)
        const caloriesBurned = Math.floor(Math.random() * 451) + 50;
        
        // Insert the exercise
        const exerciseId = await ctx.db.insert("exercise", {
          userId,
          name,
          type,
          duration,
          caloriesBurned,
          day,
          date,
          isCompleted: true
        });
        
        exerciseIds.push(exerciseId);
      }
    }
    
    return {
      success: true,
      message: `Created ${exerciseIds.length} exercise records`,
      exerciseIds
    };
  }
});
