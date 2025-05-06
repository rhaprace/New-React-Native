import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define types for workout data
interface Exercise {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
}

interface DailyWorkout {
  day: string;
  exercises: Exercise[];
}

// Weight gain workout data
const weightGainWorkouts: DailyWorkout[] = [
  {
    day: "Monday",
    exercises: [
      {
        name: "Bench Press (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 250,
      },
      {
        name: "Shoulder Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 200,
      },
      {
        name: "Tricep Extensions",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Tuesday",
    exercises: [
      {
        name: "Deadlifts (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 300,
      },
      {
        name: "Barbell Rows",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
      },
      {
        name: "Lat Pulldowns",
        type: "strength",
        duration: 20,
        caloriesBurned: 180,
      },
      {
        name: "Bicep Curls",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Thursday",
    exercises: [
      {
        name: "Squats (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 300,
      },
      {
        name: "Leg Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
      },
      {
        name: "Leg Extensions",
        type: "strength",
        duration: 20,
        caloriesBurned: 180,
      },
      {
        name: "Calf Raises",
        type: "strength",
        duration: 15,
        caloriesBurned: 120,
      },
    ],
  },
  {
    day: "Friday",
    exercises: [
      {
        name: "Overhead Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 200,
      },
      {
        name: "Dumbbell Flyes",
        type: "strength",
        duration: 25,
        caloriesBurned: 180,
      },
      {
        name: "Tricep Pushdowns",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Saturday",
    exercises: [
      {
        name: "Pull-Ups",
        type: "strength",
        duration: 25,
        caloriesBurned: 200,
      },
      {
        name: "Dumbbell Rows",
        type: "strength",
        duration: 25,
        caloriesBurned: 180,
      },
      {
        name: "Hammer Curls",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  }
];

// Get chat messages for a user
export const getChatMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50 } = args;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // If there are no messages, the chat has been reset
    // We'll return an empty array and let the client handle showing a welcome message
    return messages;
  },
});

// Add a new message to the chat
export const addChatMessage = mutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    isUserMessage: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, content, isUserMessage } = args;

    const timestamp = new Date().toISOString();

    return await ctx.db.insert("chatMessages", {
      userId,
      content,
      isUserMessage,
      timestamp,
    });
  },
});

// Generate a bot response based on user query
export const generateBotResponse = mutation({
  args: {
    userId: v.id("users"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, userMessage } = args;

    // Store the user message
    await ctx.db.insert("chatMessages", {
      userId,
      content: userMessage,
      isUserMessage: true,
      timestamp: new Date().toISOString(),
    });

    // Get user data to personalize responses
    const user = await ctx.db.get(userId);

    // Get user profile data
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Get today's date and other date references
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    // Get recent messages for context (last 5 messages)
    const recentMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    // Simple context tracking
    const conversationContext = {
      mentionedWorkout: false,
      mentionedMeal: false,
      mentionedProgress: false,
      askedForMotivation: false
    };

    // Analyze recent messages for context
    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes("workout") || content.includes("exercise")) {
        conversationContext.mentionedWorkout = true;
      }
      if (content.includes("meal") || content.includes("food") || content.includes("eat")) {
        conversationContext.mentionedMeal = true;
      }
      if (content.includes("progress") || content.includes("improve")) {
        conversationContext.mentionedProgress = true;
      }
      if (content.includes("motivate") || content.includes("motivation")) {
        conversationContext.askedForMotivation = true;
      }
    });

    // Process the user message and generate a response
    let botResponse = "";
    const normalizedMessage = userMessage.toLowerCase();

    // Enhanced keyword-based response system with more specific queries
    if (normalizedMessage.includes("hello") || normalizedMessage.includes("hi")) {
      botResponse = `Hello ${user?.fullname || "there"}! How can I help you with your fitness journey today?`;
    }
    // Handle specific profile questions
    else if (normalizedMessage.includes("age") || normalizedMessage.includes("how old")) {
      if (profile && profile.age) {
        botResponse = `You are ${profile.age} years old according to your profile.`;
      } else {
        botResponse = "I don't have your age information. You can add it in your profile settings.";
      }
    }
    else if (normalizedMessage.includes("weight") || normalizedMessage.includes("how much do i weigh")) {
      if (profile && profile.weight) {
        botResponse = `Your current weight is ${profile.weight} kg.`;
      } else {
        botResponse = "I don't have your weight information. You can add it in your profile settings.";
      }
    }
    else if (normalizedMessage.includes("height") || normalizedMessage.includes("how tall")) {
      if (profile && profile.height) {
        botResponse = `Your height is ${profile.height} cm.`;
      } else {
        botResponse = "I don't have your height information. You can add it in your profile settings.";
      }
    }
    else if (normalizedMessage.includes("gender")) {
      if (profile && profile.gender) {
        botResponse = `Your gender is set as ${profile.gender}.`;
      } else {
        botResponse = "I don't have your gender information. You can add it in your profile settings.";
      }
    }
    else if (normalizedMessage.includes("activity") || normalizedMessage.includes("active")) {
      if (profile && profile.activityLevel) {
        botResponse = `Your activity level is set as "${profile.activityLevel}".`;
      } else {
        botResponse = "I don't have your activity level information. You can add it in your profile settings.";
      }
    }
    else if (normalizedMessage.includes("bmr")) {
      if (profile && profile.bmr) {
        botResponse = `Your Basal Metabolic Rate (BMR) is ${profile.bmr} calories per day.`;
      } else {
        botResponse = "I don't have your BMR information. Complete your profile with age, weight, height, and gender to calculate it.";
      }
    }
    // General profile information
    else if (normalizedMessage.includes("profile") || normalizedMessage.includes("my info")) {
      if (profile) {
        botResponse = `Here's your profile information:\n`;
        if (profile.weight) botResponse += `Weight: ${profile.weight} kg\n`;
        if (profile.height) botResponse += `Height: ${profile.height} cm\n`;
        if (profile.age) botResponse += `Age: ${profile.age} years\n`;
        if (profile.gender) botResponse += `Gender: ${profile.gender}\n`;
        if (profile.activityLevel) botResponse += `Activity Level: ${profile.activityLevel}\n`;
        if (profile.bmr) botResponse += `BMR: ${profile.bmr} calories\n`;
        if (profile.dailyCalories) botResponse += `Daily Calorie Goal: ${profile.dailyCalories} calories`;
      } else {
        botResponse = "I don't have your profile information yet. Please complete your profile in the app.";
      }
    }
    // Calorie-related queries
    else if (normalizedMessage.includes("daily calorie") || normalizedMessage.includes("calorie goal")) {
      if (profile && profile.dailyCalories) {
        botResponse = `Your daily calorie goal is ${profile.dailyCalories} calories.`;
      } else {
        botResponse = "I don't have your daily calorie goal information. Please complete your profile to set calorie goals.";
      }
    }
    else if (normalizedMessage.includes("calories") || normalizedMessage.includes("calorie")) {
      // Get calorie tracking data
      const calorieData = await ctx.db
        .query("calorieGoalTracking")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", today)
        )
        .first();

      if (calorieData) {
        botResponse = `Today's calorie information:\n`;
        botResponse += `Goal: ${calorieData.dailyCalorieGoal} calories\n`;
        botResponse += `Consumed: ${calorieData.totalCalories} calories\n`;

        const remaining = calorieData.dailyCalorieGoal - calorieData.totalCalories;
        if (remaining > 0) {
          botResponse += `You have ${remaining} calories remaining for today.`;
        } else {
          botResponse += `You've exceeded your daily calorie goal by ${Math.abs(remaining)} calories.`;
        }
      } else {
        if (profile?.dailyCalories) {
          botResponse = `Your daily calorie goal is ${profile.dailyCalories} calories. I don't have tracking data for today yet.`;
        } else {
          botResponse = "I don't have your calorie information yet. Please complete your profile to set calorie goals.";
        }
      }
    }
    // Meal-related queries
    else if (normalizedMessage.includes("breakfast")) {
      const todaysMeals = await ctx.db
        .query("meal")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", today)
        )
        .filter((q) => q.eq(q.field("mealType"), "breakfast"))
        .collect();

      if (todaysMeals && todaysMeals.length > 0) {
        botResponse = `Here's your breakfast for today:\n`;
        todaysMeals.forEach(meal => {
          botResponse += `- ${meal.name} (${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g)\n`;
        });
      } else {
        botResponse = "You don't have any breakfast logged for today.";
      }
    }
    else if (normalizedMessage.includes("lunch")) {
      const todaysMeals = await ctx.db
        .query("meal")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", today)
        )
        .filter((q) => q.eq(q.field("mealType"), "lunch"))
        .collect();

      if (todaysMeals && todaysMeals.length > 0) {
        botResponse = `Here's your lunch for today:\n`;
        todaysMeals.forEach(meal => {
          botResponse += `- ${meal.name} (${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g)\n`;
        });
      } else {
        botResponse = "You don't have any lunch logged for today.";
      }
    }
    else if (normalizedMessage.includes("dinner")) {
      const todaysMeals = await ctx.db
        .query("meal")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", today)
        )
        .filter((q) => q.eq(q.field("mealType"), "dinner"))
        .collect();

      if (todaysMeals && todaysMeals.length > 0) {
        botResponse = `Here's your dinner for today:\n`;
        todaysMeals.forEach(meal => {
          botResponse += `- ${meal.name} (${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g)\n`;
        });
      } else {
        botResponse = "You don't have any dinner logged for today.";
      }
    }
    else if (normalizedMessage.includes("meal") || normalizedMessage.includes("food") || normalizedMessage.includes("eat")) {
      // Get today's meals
      const todaysMeals = await ctx.db
        .query("meal")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", today)
        )
        .collect();

      if (todaysMeals && todaysMeals.length > 0) {
        botResponse = `Here are your meals for today:\n`;

        // Group meals by type
        const mealsByType: Record<string, any[]> = {};
        todaysMeals.forEach(meal => {
          if (!mealsByType[meal.mealType]) {
            mealsByType[meal.mealType] = [];
          }
          mealsByType[meal.mealType].push(meal);
        });

        // Format meals by type
        for (const [type, meals] of Object.entries(mealsByType)) {
          botResponse += `\n${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
          meals.forEach(meal => {
            botResponse += `- ${meal.name} (${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g)\n`;
          });
        }
      } else {
        botResponse = "You don't have any meals logged for today. Would you like to add a meal in the meal planner?";
      }
    }
    // Workout-related queries
    else if (normalizedMessage.includes("workout") || normalizedMessage.includes("exercise")) {
      // Get today's exercises
      const todaysExercises = await ctx.db
        .query("exercise")
        .withIndex("by_user_day_date", (q) =>
          q.eq("userId", userId)
        )
        .filter((q) => q.eq(q.field("date"), today))
        .collect();

      if (todaysExercises && todaysExercises.length > 0) {
        const completedExercises = todaysExercises.filter(ex => ex.isCompleted);
        const pendingExercises = todaysExercises.filter(ex => !ex.isCompleted);

        botResponse = `Here's your workout information for today:\n`;

        if (completedExercises.length > 0) {
          botResponse += `\nCompleted Exercises (${completedExercises.length}):\n`;
          completedExercises.forEach(ex => {
            botResponse += `- ${ex.name} (${ex.duration} min, ${ex.caloriesBurned} cal)\n`;
          });
        }

        if (pendingExercises.length > 0) {
          botResponse += `\nPending Exercises (${pendingExercises.length}):\n`;
          pendingExercises.forEach(ex => {
            botResponse += `- ${ex.name} (${ex.duration} min, ${ex.caloriesBurned} cal)\n`;
          });
        }

        // Calculate total calories burned
        const totalCaloriesBurned = todaysExercises.reduce((sum, ex) => sum + (ex.isCompleted ? ex.caloriesBurned : 0), 0);
        botResponse += `\nTotal calories burned: ${totalCaloriesBurned}`;
      } else {
        botResponse = "You don't have any exercises planned for today. Would you like to add a workout?";
      }
    }
    // User information
    else if (normalizedMessage.includes("name") || normalizedMessage.includes("who am i")) {
      botResponse = `Your name is ${user?.fullname || "not set"}. You're logged in with the email ${user?.email || "unknown"}.`;
    }
    else if (normalizedMessage.includes("subscription") || normalizedMessage.includes("plan")) {
      botResponse = `Your subscription status is: ${user?.subscription || "inactive"}.`;
      if (user?.subscriptionEndDate) {
        botResponse += ` It will end on ${new Date(user.subscriptionEndDate).toLocaleDateString()}.`;
      }
    }
    // Help command
    else if (normalizedMessage.includes("help")) {
      botResponse = "I can help you with a wide range of fitness and nutrition topics:\n\n" +
        "📋 PROFILE & TRACKING\n" +
        "- Your profile information (age, weight, height, gender, activity level)\n" +
        "- Today's calorie tracking and goals\n" +
        "- Your subscription status\n\n" +

        "🍽️ NUTRITION\n" +
        "- Your meal plan for today (breakfast, lunch, dinner)\n" +
        "- Nutrition information for specific foods\n" +
        "- High-protein, high-carb, or healthy fat food recommendations\n" +
        "- Weight gain or weight loss meal plans\n" +
        "- Calorie intake history and trends\n\n" +

        "💪 FITNESS\n" +
        "- Today's workout plan\n" +
        "- Exercise recommendations based on your goals\n" +
        "- Your exercise history and statistics\n" +
        "- Specific workout recommendations for weight gain or loss\n\n" +

        "📊 PROGRESS & INSIGHTS\n" +
        "- Your fitness and nutrition progress over time\n" +
        "- Personalized insights based on your data\n" +
        "- Motivational quotes and fitness tips\n\n" +

        "Just ask me about any of these topics! For example:\n" +
        "- \"What should I eat to gain weight?\"\n" +
        "- \"Show me my exercise history\"\n" +
        "- \"What are some high-protein foods?\"\n" +
        "- \"How's my progress looking?\"";
    }
    // Progress tracking insights
    else if (normalizedMessage.includes("progress") || normalizedMessage.includes("improvement") || normalizedMessage.includes("trend")) {
      // Get historical calorie data
      const calorieHistory = await ctx.db
        .query("calorieGoalTracking")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) => q.gte(q.field("date"), lastWeek))
        .collect();

      // Get historical exercise data
      const exerciseHistory = await ctx.db
        .query("exercise")
        .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), lastWeek),
            q.eq(q.field("isCompleted"), true)
          )
        )
        .collect();

      if (calorieHistory.length > 0 || exerciseHistory.length > 0) {
        botResponse = "Here's an analysis of your recent progress:\n\n";

        if (calorieHistory.length > 0) {
          const daysOnTarget = calorieHistory.filter(day => day.goalReached && !day.goalExceeded).length;
          const daysExceeded = calorieHistory.filter(day => day.goalExceeded).length;
          const adherenceRate = Math.round((daysOnTarget / calorieHistory.length) * 100);

          botResponse += `📊 Calorie Goal Adherence: ${adherenceRate}%\n`;
          botResponse += `✅ Days on target: ${daysOnTarget}\n`;
          botResponse += `⚠️ Days exceeded: ${daysExceeded}\n\n`;
        }

        if (exerciseHistory.length > 0) {
          const totalCaloriesBurned = exerciseHistory.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
          const totalMinutes = exerciseHistory.reduce((sum, ex) => sum + ex.duration, 0);
          const uniqueExercises = new Set(exerciseHistory.map(ex => ex.name)).size;

          botResponse += `🔥 Total calories burned: ${totalCaloriesBurned}\n`;
          botResponse += `⏱️ Total workout time: ${totalMinutes} minutes\n`;
          botResponse += `🏋️ Unique exercises performed: ${uniqueExercises}\n\n`;
        }

        // Add personalized insight
        if (profile) {
          if (calorieHistory.length > 0 && exerciseHistory.length > 0) {
            const recentCalorieAvg = calorieHistory.reduce((sum, day) => sum + day.totalCalories, 0) / calorieHistory.length;
            const caloriesBurnedAvg = exerciseHistory.reduce((sum, ex) => sum + ex.caloriesBurned, 0) / 7;

            if (recentCalorieAvg > (profile.dailyCalories || 2000) && caloriesBurnedAvg < 200) {
              botResponse += "💡 Insight: Your calorie intake has been higher than your goal, while your exercise activity has been relatively low. Consider increasing your workout frequency or intensity.";
            } else if (recentCalorieAvg < (profile.dailyCalories || 2000) * 0.8) {
              botResponse += "💡 Insight: Your calorie intake has been significantly below your goal. Make sure you're getting enough nutrition to support your fitness journey.";
            } else {
              botResponse += "💡 Insight: You're maintaining a good balance between your calorie intake and exercise. Keep up the good work!";
            }
          }
        }
      } else {
        botResponse = "I don't have enough data to analyze your progress yet. Keep tracking your meals and workouts, and I'll be able to provide insights soon!";
      }
    }
    // Motivational messages
    else if (normalizedMessage.includes("motivate") || normalizedMessage.includes("motivation") || normalizedMessage.includes("inspire")) {
      const motivationalQuotes = [
        "The only bad workout is the one that didn't happen. Every step counts!",
        "Your body can stand almost anything. It's your mind that you have to convince.",
        "Fitness is not about being better than someone else. It's about being better than you used to be.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Don't wish for it, work for it.",
        "Small progress is still progress. Keep going!",
        "The hardest lift of all is lifting your butt off the couch.",
        "You don't have to be extreme, just consistent.",
        "It's not about having time, it's about making time.",
        "Your health is an investment, not an expense."
      ];

      // Select a quote based on user context
      let selectedQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

      // Personalize the motivation
      botResponse = `Here's some motivation for you:\n\n"${selectedQuote}"\n\n`;

      // Add personalized encouragement based on user data
      if (profile) {
        // Get recent exercise data
        const recentExercises = await ctx.db
          .query("exercise")
          .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
          .filter((q) =>
            q.and(
              q.gte(q.field("date"), yesterday),
              q.eq(q.field("isCompleted"), true)
            )
          )
          .collect();

        if (recentExercises.length > 0) {
          botResponse += `You've completed ${recentExercises.length} exercises recently. That's great discipline! 💪`;
        } else {
          const plannedExercises = await ctx.db
            .query("exercise")
            .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("date"), today),
                q.eq(q.field("isCompleted"), false)
              )
            )
            .collect();

          if (plannedExercises.length > 0) {
            botResponse += `You have ${plannedExercises.length} exercises planned for today. You've got this! 💯`;
          } else {
            botResponse += "Remember, consistency is key to reaching your fitness goals. Even a small workout today is better than none! 🌟";
          }
        }
      }
    }
    else if (normalizedMessage.includes("yesterday") || normalizedMessage.match(/last (day|night)/i)) {
      if (normalizedMessage.includes("calorie") || normalizedMessage.includes("eat") || normalizedMessage.includes("food") || normalizedMessage.includes("meal")) {
        const yesterdaysMeals = await ctx.db
          .query("meal")
          .withIndex("by_user_date", (q) =>
            q.eq("userId", userId).eq("date", yesterday)
          )
          .collect();

        if (yesterdaysMeals && yesterdaysMeals.length > 0) {
          botResponse = `Here are your meals from yesterday (${new Date(yesterday).toLocaleDateString()}):\n`;
          const mealsByType: Record<string, any[]> = {};
          yesterdaysMeals.forEach(meal => {
            if (!mealsByType[meal.mealType]) {
              mealsByType[meal.mealType] = [];
            }
            mealsByType[meal.mealType].push(meal);
          });
          for (const [type, meals] of Object.entries(mealsByType)) {
            botResponse += `\n${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
            meals.forEach(meal => {
              botResponse += `- ${meal.name} (${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g)\n`;
            });
          }
          const totalCalories = yesterdaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
          botResponse += `\nTotal calories: ${totalCalories}`;
        } else {
          botResponse = "I don't have any meal records for yesterday.";
        }
      } else if (normalizedMessage.includes("workout") || normalizedMessage.includes("exercise")) {
        const yesterdaysExercises = await ctx.db
          .query("exercise")
          .withIndex("by_user_day_date", (q) =>
            q.eq("userId", userId)
          )
          .filter((q) => q.eq(q.field("date"), yesterday))
          .collect();

        if (yesterdaysExercises && yesterdaysExercises.length > 0) {
          const completedExercises = yesterdaysExercises.filter(ex => ex.isCompleted);

          botResponse = `Here's your workout information from yesterday (${new Date(yesterday).toLocaleDateString()}):\n`;

          if (completedExercises.length > 0) {
            botResponse += `\nCompleted Exercises (${completedExercises.length}):\n`;
            completedExercises.forEach(ex => {
              botResponse += `- ${ex.name} (${ex.duration} min, ${ex.caloriesBurned} cal)\n`;
            });

            // Calculate total calories burned
            const totalCaloriesBurned = completedExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
            botResponse += `\nTotal calories burned: ${totalCaloriesBurned}`;
          } else {
            botResponse += "\nYou didn't complete any exercises yesterday.";
          }
        } else {
          botResponse = "I don't have any exercise records for yesterday.";
        }
      } else {
        botResponse = "What would you like to know about yesterday? You can ask about your meals or workouts.";
      }
    }
    // Personalized fitness tips
    else if (normalizedMessage.includes("tip") || normalizedMessage.includes("advice") || normalizedMessage.includes("suggest")) {
      // Generate personalized fitness tip based on user data
      const generalTips = [
        "Try to drink at least 8 glasses of water daily to stay hydrated.",
        "Aim for 7-9 hours of quality sleep to support recovery and performance.",
        "Include protein in every meal to support muscle recovery and growth.",
        "Don't forget to stretch before and after your workouts to prevent injuries.",
        "Try to incorporate both cardio and strength training in your fitness routine.",
        "Small, consistent efforts lead to big results over time.",
        "Track your progress regularly to stay motivated and see how far you've come.",
        "Rest days are just as important as workout days for recovery and growth.",
        "Try to eat a variety of colorful fruits and vegetables for essential nutrients.",
        "Set specific, measurable, achievable, relevant, and time-bound (SMART) fitness goals."
      ];

      // Select a base tip
      let selectedTip = generalTips[Math.floor(Math.random() * generalTips.length)];
      botResponse = `Here's a fitness tip for you:\n\n${selectedTip}\n\n`;

      // Add personalized advice based on user data
      if (profile) {
        // Get recent calorie data
        const recentCalorieData = await ctx.db
          .query("calorieGoalTracking")
          .withIndex("by_user_date", (q) => q.eq("userId", userId))
          .order("desc")
          .take(3);

        // Get recent exercise data
        const recentExercises = await ctx.db
          .query("exercise")
          .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
          .filter((q) => q.gte(q.field("date"), lastWeek))
          .collect();

        // Personalized tip based on data
        if (recentCalorieData.length > 0) {
          const exceededDays = recentCalorieData.filter(day => day.goalExceeded).length;

          if (exceededDays >= 2) {
            botResponse += "I've noticed you've exceeded your calorie goals recently. Try meal prepping or using smaller plates to help with portion control. 🍽️";
          } else if (recentCalorieData.every(day => day.totalCalories < (profile.dailyCalories || 2000) * 0.8)) {
            botResponse += "I've noticed you've been consistently under your calorie goals. Make sure you're getting enough nutrition to fuel your workouts and recovery. 🥗";
          }
        }

        if (recentExercises.length > 0) {
          const exerciseTypes = new Set(recentExercises.map(ex => ex.type));

          if (!exerciseTypes.has("cardio")) {
            botResponse += "\n\nConsider adding some cardio exercises to your routine for heart health and endurance. Even a 20-minute brisk walk can make a difference! 🏃‍♂️";
          } else if (!exerciseTypes.has("strength")) {
            botResponse += "\n\nYou might benefit from adding strength training to your routine. It helps build muscle, increase metabolism, and improve overall fitness. 🏋️‍♀️";
          }
        }
      }
    }
    // Food calorie questions
    else if (normalizedMessage.includes("highest calorie") || normalizedMessage.includes("most calories") ||
             normalizedMessage.includes("high calorie") || normalizedMessage.includes("highest cal")) {
      // Get foods sorted by calories (highest first)
      const highCalorieFoods = await ctx.db
        .query("foodMacros")
        .collect();

      if (highCalorieFoods.length > 0) {
        // Sort by calories in descending order
        highCalorieFoods.sort((a, b) => b.calories - a.calories);

        // Take top 5 foods
        const topFoods = highCalorieFoods.slice(0, 5);

        botResponse = `Here are the foods with the highest calories in our database:\n\n`;
        topFoods.forEach((food, index) => {
          botResponse += `${index + 1}. ${food.name} - ${food.calories} calories per serving\n`;
        });

        botResponse += `\nThese high-calorie foods can be useful for weight gain goals or for refueling after intense workouts.`;
      } else {
        botResponse = "I don't have any food data available at the moment. Please check back later.";
      }
    }
    // Weight gain specific recommendations
    else if (normalizedMessage.includes("weight gain") || normalizedMessage.includes("gain weight") || normalizedMessage.includes("build muscle")) {
      // Determine if the query is about exercises, meals, or both
      const isExerciseQuery = normalizedMessage.includes("exercise") || normalizedMessage.includes("workout");
      const isMealQuery = normalizedMessage.includes("meal") || normalizedMessage.includes("food") || normalizedMessage.includes("eat");

      // If neither is specified, assume both
      const includeExercise = isExerciseQuery || (!isExerciseQuery && !isMealQuery);
      const includeMeal = isMealQuery || (!isExerciseQuery && !isMealQuery);

      botResponse = "Here are my recommendations for weight gain:\n\n";

      // Add calorie surplus advice based on profile if available
      if (profile && profile.dailyCalories) {
        const weightGainCalories = Math.round(profile.dailyCalories * 1.15); // 15% surplus
        botResponse += `Based on your profile, you should aim for about ${weightGainCalories} calories daily (a surplus of ${weightGainCalories - profile.dailyCalories} calories) to support weight gain.\n\n`;
      } else {
        botResponse += "For weight gain, you generally need to consume 300-500 calories above your maintenance level daily.\n\n";
      }

      // Add meal recommendations if requested
      if (includeMeal) {
        // Get food recommendations for weight gain
        const foodMacros = await ctx.db
          .query("foodMacros")
          .collect();

        if (foodMacros.length > 0) {
          // Filter for high protein foods
          const highProteinFoods = foodMacros
            .filter(food => food.protein > 20)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          // Filter for calorie-rich carbs
          const calorieRichCarbs = foodMacros
            .filter(food => food.category === "carb" && food.calories > 100)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          // Filter for healthy fats
          const healthyFats = foodMacros
            .filter(food => food.category === "fat" && food.calories > 100)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

          botResponse += "🍽️ MEAL RECOMMENDATIONS FOR WEIGHT GAIN:\n\n";

          botResponse += "High-Protein Foods (essential for muscle building):\n";
          highProteinFoods.forEach(food => {
            botResponse += `- ${food.name} (${food.calories} cal, ${food.protein}g protein)\n`;
          });

          botResponse += "\nCalorie-Rich Carbohydrates (for energy and surplus calories):\n";
          calorieRichCarbs.forEach(food => {
            botResponse += `- ${food.name} (${food.calories} cal, ${food.carbs}g carbs)\n`;
          });

          botResponse += "\nHealthy Fats (calorie-dense for weight gain):\n";
          healthyFats.forEach(food => {
            botResponse += `- ${food.name} (${food.calories} cal, ${food.fat}g fat)\n`;
          });

          botResponse += "\nSample Weight Gain Meals:\n";
          botResponse += "- Breakfast: Greek yogurt with granola, banana, and peanut butter (~600 cal)\n";
          botResponse += "- Lunch: Grilled chicken breast with quinoa, avocado, and sweet potatoes (~750 cal)\n";
          botResponse += "- Dinner: Salmon with mashed potatoes and olive oil (~800 cal)\n";
          botResponse += "- Snack: Protein shake with whole milk and a handful of nuts (~400 cal)\n\n";

          botResponse += "💡 Meal Tips:\n";
          botResponse += "- Eat 4-6 meals per day instead of 3 larger ones\n";
          botResponse += "- Have a protein-rich meal within 1-2 hours after workouts\n";
          botResponse += "- Include protein in every meal (aim for 1.6-2.2g per kg of bodyweight daily)\n";
          botResponse += "- Use calorie-dense toppings: olive oil, cheese, nuts, seeds\n";
        } else {
          botResponse += "I don't have specific food data available, but for weight gain, focus on calorie-dense foods rich in protein, healthy fats, and complex carbohydrates.\n\n";
        }
      }

      // Add exercise recommendations if requested
      if (includeExercise) {
        botResponse += "\n💪 EXERCISE RECOMMENDATIONS FOR WEIGHT GAIN:\n\n";
        botResponse += "Focus on compound strength exercises that target multiple muscle groups:\n\n";

        // Get a random day from the weight gain workouts
        const days = ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"];
        const randomDay = days[Math.floor(Math.random() * days.length)];
        const workoutDay = weightGainWorkouts.find(workout => workout.day === randomDay);

        if (workoutDay) {
          botResponse += `Sample ${workoutDay.day} Workout:\n`;
          workoutDay.exercises.forEach(exercise => {
            if (exercise.type === "strength") {
              botResponse += `- ${exercise.name} (${exercise.duration} min)\n`;
            }
          });
        }

        botResponse += "\n💡 Workout Tips:\n";
        botResponse += "- Focus on heavy compound movements (squats, deadlifts, bench press)\n";
        botResponse += "- Aim for 3-4 strength training sessions per week\n";
        botResponse += "- Prioritize progressive overload (gradually increasing weight)\n";
        botResponse += "- Keep cardio moderate (1-2 sessions weekly) to avoid excessive calorie burn\n";
        botResponse += "- Allow 48 hours of recovery for each muscle group\n";
        botResponse += "- Ensure adequate sleep (7-9 hours) for muscle recovery and growth\n";
      }

      // General advice for both
      botResponse += "\n🔑 KEYS TO SUCCESSFUL WEIGHT GAIN:\n";
      botResponse += "1. Maintain a consistent calorie surplus\n";
      botResponse += "2. Prioritize protein intake for muscle building\n";
      botResponse += "3. Progressive overload in your strength training\n";
      botResponse += "4. Allow adequate recovery between workouts\n";
      botResponse += "5. Be patient and consistent - aim for 0.25-0.5kg gain per week\n";

      // Suggest tracking
      botResponse += "\nRemember to track your progress in the app to see what's working for you!";
    }
    // Lowest calorie foods
    else if (normalizedMessage.includes("lowest calorie") || normalizedMessage.includes("least calories") ||
             normalizedMessage.includes("low calorie") || normalizedMessage.includes("lowest cal")) {
      // Get foods sorted by calories (lowest first)
      const lowCalorieFoods = await ctx.db
        .query("foodMacros")
        .collect();

      if (lowCalorieFoods.length > 0) {
        // Sort by calories in ascending order
        lowCalorieFoods.sort((a, b) => a.calories - b.calories);

        // Take top 5 foods
        const topFoods = lowCalorieFoods.slice(0, 5);

        botResponse = `Here are the foods with the lowest calories in our database:\n\n`;
        topFoods.forEach((food, index) => {
          botResponse += `${index + 1}. ${food.name} - ${food.calories} calories per serving\n`;
        });

        botResponse += `\nThese low-calorie foods can be great options for weight loss goals or for adding volume to your meals without adding many calories.`;
      } else {
        botResponse = "I don't have any food data available at the moment. Please check back later.";
      }
    }
    // Proactive suggestions
    else if (normalizedMessage.includes("what should i") || normalizedMessage.includes("recommend") || normalizedMessage.includes("suggestion")) {
      if (normalizedMessage.includes("eat") || normalizedMessage.includes("meal") || normalizedMessage.includes("food")) {
        // Get food recommendations based on user's profile
        const foodMacros = await ctx.db
          .query("foodMacros")
          .collect();

        if (foodMacros.length > 0 && profile) {
          let recommendedFoods = [];

          // Filter foods based on user's needs
          if (profile.dailyCalories) {
            // Determine if user needs more protein, carbs, or balanced meals
            const todaysMeals = await ctx.db
              .query("meal")
              .withIndex("by_user_date", (q) =>
                q.eq("userId", userId).eq("date", today)
              )
              .collect();

            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;

            if (todaysMeals.length > 0) {
              totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
              totalCarbs = todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0);
              totalFat = todaysMeals.reduce((sum, meal) => sum + meal.fat, 0);
            }

            // Determine what macros the user needs more of
            const proteinGoal = (profile.dailyCalories * 0.3) / 4; // 30% of calories from protein
            const carbsGoal = (profile.dailyCalories * 0.45) / 4; // 45% of calories from carbs
            const fatGoal = (profile.dailyCalories * 0.25) / 9; // 25% of calories from fat

            let macroNeeded = "balanced";
            if (totalProtein < proteinGoal * 0.7) {
              macroNeeded = "protein";
            } else if (totalCarbs < carbsGoal * 0.7) {
              macroNeeded = "carbs";
            } else if (totalFat < fatGoal * 0.7) {
              macroNeeded = "fat";
            }
            recommendedFoods = foodMacros
              .filter(food => food.category === macroNeeded || !food.category)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);

            botResponse = `Based on your nutritional needs today, here are some food recommendations:\n\n`;
            recommendedFoods.forEach(food => {
              botResponse += `- ${food.name} (${food.calories} cal, P: ${food.protein}g, C: ${food.carbs}g, F: ${food.fat}g)\n`;
            });

            botResponse += `\nThese foods are rich in ${macroNeeded}, which would help balance your macronutrient intake for today.`;
          } else {
            recommendedFoods = foodMacros
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);

            botResponse = `Here are some food recommendations:\n\n`;
            recommendedFoods.forEach(food => {
              botResponse += `- ${food.name} (${food.calories} cal, P: ${food.protein}g, C: ${food.carbs}g, F: ${food.fat}g)\n`;
            });
          }
        } else {
          botResponse = "I don't have enough food data to make personalized recommendations yet.";
        }
      } else if (normalizedMessage.includes("workout") || normalizedMessage.includes("exercise")) {
        const exerciseHistory = await ctx.db
          .query("exercise")
          .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
          .filter((q) => q.gte(q.field("date"), lastWeek))
          .collect();
        type ExerciseType = "cardio" | "strength" | "flexibility";
        type Exercise = {
          name: string;
          duration: number;
          caloriesBurned: number;
        };
        let recommendedType: ExerciseType = "cardio";

        if (exerciseHistory.length > 0) {
          const exerciseTypes = exerciseHistory.map(ex => ex.type);
          const cardioCount = exerciseTypes.filter(type => type === "cardio").length;
          const strengthCount = exerciseTypes.filter(type => type === "strength").length;
          recommendedType = cardioCount <= strengthCount ? "cardio" : "strength";
        }
        const exerciseRecommendations: Record<ExerciseType, Exercise[]> = {
          cardio: [
            { name: "Running", duration: 30, caloriesBurned: 300 },
            { name: "Cycling", duration: 30, caloriesBurned: 250 },
            { name: "Jumping Rope", duration: 20, caloriesBurned: 200 },
            { name: "Swimming", duration: 30, caloriesBurned: 350 },
            { name: "Elliptical", duration: 30, caloriesBurned: 270 }
          ],
          strength: [
            { name: "Push-ups", duration: 15, caloriesBurned: 100 },
            { name: "Squats", duration: 20, caloriesBurned: 150 },
            { name: "Deadlifts", duration: 20, caloriesBurned: 180 },
            { name: "Pull-ups", duration: 15, caloriesBurned: 120 },
            { name: "Bench Press", duration: 20, caloriesBurned: 160 }
          ],
          flexibility: [
            { name: "Yoga", duration: 30, caloriesBurned: 150 },
            { name: "Stretching", duration: 20, caloriesBurned: 80 },
            { name: "Pilates", duration: 30, caloriesBurned: 170 }
          ]
        };
        const selectedExercises = exerciseRecommendations[recommendedType]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        botResponse = `Based on your recent activity, I recommend focusing on ${recommendedType} exercises today:\n\n`;
        selectedExercises.forEach((ex: Exercise) => {
          botResponse += `- ${ex.name} (${ex.duration} min, ~${ex.caloriesBurned} calories)\n`;
        });
        // Only add flexibility exercise if the recommended type is not already flexibility
        if (recommendedType === "cardio" || recommendedType === "strength") {
          const flexExercise = exerciseRecommendations.flexibility[Math.floor(Math.random() * exerciseRecommendations.flexibility.length)];
          botResponse += `\nAlso, consider adding this for flexibility:\n- ${flexExercise.name} (${flexExercise.duration} min, ~${flexExercise.caloriesBurned} calories)`;
        }
      } else {
        botResponse = "I can recommend meals or workouts based on your profile and history. Just ask for a meal or workout recommendation!";
      }
    }
    // Advanced data query handling - this section handles more complex queries
    else {
      // Try to understand what data the user is asking for
      const isAskingAboutFood = normalizedMessage.includes("food") ||
                               normalizedMessage.includes("nutrition") ||
                               normalizedMessage.includes("nutrient") ||
                               normalizedMessage.includes("macro");

      const isAskingAboutExercise = normalizedMessage.includes("exercise history") ||
                                   normalizedMessage.includes("workout history") ||
                                   normalizedMessage.includes("past workout") ||
                                   normalizedMessage.includes("past exercise") ||
                                   (normalizedMessage.includes("show") && normalizedMessage.includes("exercise")) ||
                                   (normalizedMessage.includes("my") && normalizedMessage.includes("exercise"));

      const isAskingAboutProgress = normalizedMessage.includes("progress") ||
                                   normalizedMessage.includes("improvement") ||
                                   normalizedMessage.includes("history") ||
                                   normalizedMessage.includes("trend") ||
                                   (normalizedMessage.includes("how") && normalizedMessage.includes("doing")) ||
                                   (normalizedMessage.includes("how's") && normalizedMessage.includes("my")) ||
                                   (normalizedMessage.includes("how") && normalizedMessage.includes("my") && normalizedMessage.includes("look"));

      const isAskingAboutCalories = normalizedMessage.includes("calorie history") ||
                                   normalizedMessage.includes("calorie trend") ||
                                   normalizedMessage.includes("calorie intake") ||
                                   (normalizedMessage.includes("my") && normalizedMessage.includes("calorie")) ||
                                   (normalizedMessage.includes("about") && normalizedMessage.includes("calorie"));

      // Handle food-related queries
      if (isAskingAboutFood) {
        // Get all food data from the database
        const allFoods = await ctx.db.query("foodMacros").collect();

        if (allFoods.length > 0) {
          // Check for specific food queries
          if (normalizedMessage.includes("protein") || normalizedMessage.includes("high protein") || normalizedMessage.includes("high-protein")) {
            const highProteinFoods = allFoods
              .filter(food => food.protein > 20)
              .sort((a, b) => b.protein - a.protein)
              .slice(0, 5);

            botResponse = "Here are some high-protein foods:\n\n";
            highProteinFoods.forEach(food => {
              botResponse += `- ${food.name}: ${food.protein}g protein (${food.calories} calories)\n`;
            });
          }
          else if (normalizedMessage.includes("carb") || normalizedMessage.includes("carbohydrate")) {
            const highCarbFoods = allFoods
              .filter(food => food.carbs > 20)
              .sort((a, b) => b.carbs - a.carbs)
              .slice(0, 5);

            botResponse = "Here are some high-carbohydrate foods:\n\n";
            highCarbFoods.forEach(food => {
              botResponse += `- ${food.name}: ${food.carbs}g carbs (${food.calories} calories)\n`;
            });
          }
          else if (normalizedMessage.includes("fat") || normalizedMessage.includes("healthy fat")) {
            const healthyFats = allFoods
              .filter(food => food.fat > 10)
              .sort((a, b) => b.fat - a.fat)
              .slice(0, 5);

            botResponse = "Here are some healthy fat sources:\n\n";
            healthyFats.forEach(food => {
              botResponse += `- ${food.name}: ${food.fat}g fat (${food.calories} calories)\n`;
            });
          }
          else {
            // General food database query
            const randomFoods = [...allFoods]
              .sort(() => 0.5 - Math.random())
              .slice(0, 5);

            botResponse = "Here are some foods from our database:\n\n";
            randomFoods.forEach(food => {
              botResponse += `- ${food.name}: ${food.calories} calories (P: ${food.protein}g, C: ${food.carbs}g, F: ${food.fat}g)\n`;
            });

            botResponse += "\n\nYou can ask about specific nutrients like protein, carbs, or fats.";
          }
        } else {
          botResponse = "I don't have any food data available at the moment.";
        }
      }
      // Handle exercise history queries
      else if (isAskingAboutExercise) {
        // Get exercise history for the past 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

        const exerciseHistory = await ctx.db
          .query("exercise")
          .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
          .filter((q) =>
            q.and(
              q.gte(q.field("date"), thirtyDaysAgo),
              q.eq(q.field("isCompleted"), true)
            )
          )
          .collect();

        if (exerciseHistory.length > 0) {
          // Group exercises by type
          const exercisesByType: Record<string, any[]> = {};
          exerciseHistory.forEach(ex => {
            if (!exercisesByType[ex.type]) {
              exercisesByType[ex.type] = [];
            }
            exercisesByType[ex.type].push(ex);
          });

          botResponse = `Here's your exercise history for the past 30 days:\n\n`;

          // Calculate stats for each type
          for (const [type, exercises] of Object.entries(exercisesByType)) {
            const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
            const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
            const uniqueExercises = new Set(exercises.map(ex => ex.name)).size;

            botResponse += `${type.charAt(0).toUpperCase() + type.slice(1)} Exercises:\n`;
            botResponse += `- Total workouts: ${exercises.length}\n`;
            botResponse += `- Total duration: ${totalDuration} minutes\n`;
            botResponse += `- Calories burned: ${totalCalories}\n`;
            botResponse += `- Unique exercises: ${uniqueExercises}\n\n`;
          }

          // Add most frequent exercises
          const exerciseCounts: Record<string, number> = {};
          exerciseHistory.forEach(ex => {
            exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
          });

          const mostFrequent = Object.entries(exerciseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

          botResponse += "Your most frequent exercises:\n";
          mostFrequent.forEach(([name, count]) => {
            botResponse += `- ${name}: ${count} times\n`;
          });
        } else {
          botResponse = "You don't have any completed exercises in the past 30 days. Start working out to build your exercise history!";
        }
      }
      // Handle calorie history queries
      else if (isAskingAboutCalories) {
        // Get calorie tracking data for the past 14 days
        const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

        const calorieHistory = await ctx.db
          .query("calorieGoalTracking")
          .withIndex("by_user_date", (q) => q.eq("userId", userId))
          .filter((q) => q.gte(q.field("date"), twoWeeksAgo))
          .collect();

        if (calorieHistory.length > 0) {
          // Sort by date
          calorieHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const averageCalories = Math.round(
            calorieHistory.reduce((sum, day) => sum + day.totalCalories, 0) / calorieHistory.length
          );

          const daysOnTarget = calorieHistory.filter(day =>
            day.totalCalories >= day.dailyCalorieGoal * 0.9 &&
            day.totalCalories <= day.dailyCalorieGoal * 1.1
          ).length;

          botResponse = `Here's your calorie intake history for the past 14 days:\n\n`;
          botResponse += `Average daily calories: ${averageCalories}\n`;
          botResponse += `Days on target (±10%): ${daysOnTarget} out of ${calorieHistory.length}\n\n`;

          botResponse += "Recent daily intake:\n";
          // Show the last 7 days or fewer if not enough data
          const recentDays = calorieHistory.slice(-7);
          recentDays.forEach(day => {
            const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const percentage = Math.round((day.totalCalories / day.dailyCalorieGoal) * 100);
            botResponse += `- ${date}: ${day.totalCalories} cal (${percentage}% of goal)\n`;
          });
        } else {
          botResponse = "I don't have any calorie tracking data for you yet. Start logging your meals to track your calorie intake!";
        }
      }
      // Handle progress queries
      else if (isAskingAboutProgress) {
        // Get both exercise and calorie data
        const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

        const [calorieHistory, exerciseHistory] = await Promise.all([
          ctx.db
            .query("calorieGoalTracking")
            .withIndex("by_user_date", (q) => q.eq("userId", userId))
            .filter((q) => q.gte(q.field("date"), twoWeeksAgo))
            .collect(),
          ctx.db
            .query("exercise")
            .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.gte(q.field("date"), twoWeeksAgo),
                q.eq(q.field("isCompleted"), true)
              )
            )
            .collect()
        ]);

        if (calorieHistory.length > 0 || exerciseHistory.length > 0) {
          botResponse = "Here's a summary of your progress over the past 2 weeks:\n\n";

          if (calorieHistory.length > 0) {
            const averageCalories = Math.round(
              calorieHistory.reduce((sum, day) => sum + day.totalCalories, 0) / calorieHistory.length
            );

            const calorieGoal = calorieHistory[0].dailyCalorieGoal;
            const caloriePercentage = Math.round((averageCalories / calorieGoal) * 100);

            botResponse += `📊 Nutrition Progress:\n`;
            botResponse += `- Average daily calories: ${averageCalories} (${caloriePercentage}% of goal)\n`;
            botResponse += `- Days tracked: ${calorieHistory.length} out of 14\n\n`;
          }

          if (exerciseHistory.length > 0) {
            const totalWorkouts = exerciseHistory.length;
            const totalCaloriesBurned = exerciseHistory.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
            const totalDuration = exerciseHistory.reduce((sum, ex) => sum + ex.duration, 0);

            botResponse += `💪 Fitness Progress:\n`;
            botResponse += `- Workouts completed: ${totalWorkouts}\n`;
            botResponse += `- Total workout time: ${totalDuration} minutes\n`;
            botResponse += `- Calories burned: ${totalCaloriesBurned}\n\n`;

            // Calculate workout frequency
            const daysWithWorkouts = new Set(exerciseHistory.map(ex => ex.date)).size;
            const workoutFrequency = Math.round((daysWithWorkouts / 14) * 100);

            botResponse += `- Workout frequency: ${workoutFrequency}% of days\n\n`;
          }

          // Add personalized insights
          if (profile) {
            botResponse += "💡 Personalized Insights:\n";

            if (calorieHistory.length > 0 && exerciseHistory.length > 0) {
              const averageCalories = calorieHistory.reduce((sum, day) => sum + day.totalCalories, 0) / calorieHistory.length;
              const caloriesBurnedAvg = exerciseHistory.reduce((sum, ex) => sum + ex.caloriesBurned, 0) / 14;

              if (averageCalories > (profile.dailyCalories || 2000) && caloriesBurnedAvg < 200) {
                botResponse += "- Your calorie intake has been higher than your goal, while your exercise activity has been relatively low. Consider increasing your workout frequency or intensity.\n";
              } else if (averageCalories < (profile.dailyCalories || 2000) * 0.8) {
                botResponse += "- Your calorie intake has been significantly below your goal. Make sure you're getting enough nutrition to support your fitness journey.\n";
              } else {
                botResponse += "- You're maintaining a good balance between your calorie intake and exercise. Keep up the good work!\n";
              }
            } else if (calorieHistory.length === 0 && exerciseHistory.length > 0) {
              botResponse += "- You're tracking your workouts but not your nutrition. For best results, track both your exercise and food intake.\n";
            } else if (calorieHistory.length > 0 && exerciseHistory.length === 0) {
              botResponse += "- You're tracking your nutrition but not your workouts. Adding regular exercise will help you reach your fitness goals faster.\n";
            }
          }
        } else {
          botResponse = "I don't have enough data to analyze your progress yet. Start tracking your meals and workouts, and I'll be able to provide insights soon!";
        }
      }
      // Default response for unrecognized queries
      else {
        botResponse = "I'm not sure how to help with that specific question. I can provide information about your profile (age, weight, height), calories, meals, and workouts.";

        if (conversationContext.mentionedWorkout) {
          botResponse += "\n\nSince we were talking about workouts, you might want to ask about your exercise history or get a workout recommendation.";
        } else if (conversationContext.mentionedMeal) {
          botResponse += "\n\nSince we were talking about meals, you might want to ask about your meal history or get a food recommendation.";
        } else if (conversationContext.mentionedProgress) {
          botResponse += "\n\nSince we were talking about progress, you might want to ask for insights about your fitness journey or some motivational tips.";
        } else {
          botResponse += "\n\nYou can ask me about:";
          botResponse += "\n- Your profile information";
          botResponse += "\n- Today's meals and calories";
          botResponse += "\n- Exercise recommendations";
          botResponse += "\n- Food nutrition information";
          botResponse += "\n- Your progress and history";
          botResponse += "\n- Weight gain or loss recommendations";
        }
      }
    }
    const botMessageId = await ctx.db.insert("chatMessages", {
      userId,
      content: botResponse,
      isUserMessage: false,
      timestamp: new Date().toISOString(),
    });

    return {
      messageId: botMessageId,
      content: botResponse
    };
  },
});
