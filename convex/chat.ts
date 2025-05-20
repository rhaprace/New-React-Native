import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Define regex patterns for message matching
const MESSAGE_PATTERNS = {
  // Profile related patterns
  profile:
    /^(?:show|tell|get|what|about)\s+(?:my\s+)?(?:profile|stats|information|details|data|measurements|goals|settings)$/i,

  // Workout related patterns
  workout:
    /^(?:show|tell|get|what|about)\s+(?:my\s+)?(?:workout|exercise|training|fitness|gym|routine)(?:\s+(?:plan|schedule|program|today|this week))?$/i,
  workoutProgress:
    /^(?:check|show|what|how)\s+(?:is|was)\s+(?:my\s+)?(?:workout|exercise|training|fitness)\s+(?:progress|improvement|results)$/i,

  // Nutrition related patterns
  nutrition:
    /^(?:show|tell|get|what|about)\s+(?:my\s+)?(?:meal|food|nutrition|diet|calories|eating|macros)(?:\s+(?:plan|today|this week))?$/i,
  nutritionProgress:
    /^(?:check|show|what|how)\s+(?:is|was)\s+(?:my\s+)?(?:meal|food|nutrition|diet)\s+(?:progress|tracking|history)$/i,

  // Progress tracking patterns
  progress:
    /^(?:show|tell|get|what|about)\s+(?:my\s+)?(?:overall\s+)?(?:progress|improvement|trend|results|achievement|stats)$/i,
  weightProgress:
    /^(?:check|show|what|how)\s+(?:is|was)\s+(?:my\s+)?(?:weight|body)\s+(?:progress|change|trend)$/i,

  // Recommendation patterns
  recommendation:
    /^(?:recommend|suggest|advice|what|should|can|could)\s+(?:you\s+)?(?:give|tell|show)\s+(?:me|my)\s+(?:about|for|to)?/i,
  mealRecommendation:
    /^(?:recommend|suggest|what|should)\s+(?:i|me)\s+(?:eat|have|cook|prepare)\s+(?:for\s+)?(?:meal|food|breakfast|lunch|dinner|snack)$/i,
  workoutRecommendation:
    /^(?:recommend|suggest|what|should)\s+(?:i|me)\s+(?:do|try)\s+(?:for\s+)?(?:workout|exercise|training|routine|fitness)$/i,

  // Specific queries
  calorieCheck:
    /^(?:how|what|tell|show)\s+(?:many|much)\s+(?:calories|calorie)\s+(?:did|have|should)\s+(?:i|me)\s+(?:eat|burn|consume|need)$/i,
  macroCheck:
    /^(?:how|what|tell|show)\s+(?:are|is|about)\s+(?:my\s+)?(?:protein|carbs|fat|macros|macronutrients)(?:\s+(?:today|this week|goals))?$/i,
  goalCheck:
    /^(?:how|what|tell|show)\s+(?:am|is|are)\s+(?:i|my|the)\s+(?:doing|progressing|performing)\s+(?:on|with|in)\s+(?:my\s+)?(?:goals|targets|objectives)$/i,

  // Help and guidance
  help: /^(?:help|guide|assist|support|what can you do|how do you work)$/i,
  settings: /^(?:settings|preferences|configure|setup|customize)$/i,
};

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
  },
];

// Add these helper functions at the top of the file after imports
interface MealRecommendation {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  reason: string;
}

function analyzeNutritionalNeeds(
  profile: any,
  historicalMeals: any[],
  todayMeals: any[],
  calorieTracking: any
): {
  needs: string[];
  goals: { calories: number; protein: number; carbs: number; fat: number };
} {
  const needs: string[] = [];
  const goals = {
    calories: profile?.dailyCalories || 2000,
    protein: profile?.weight ? profile.weight * 1.6 : 80, // 1.6g per kg of bodyweight
    carbs: profile?.dailyCalories ? (profile.dailyCalories * 0.45) / 4 : 225, // 45% of calories from carbs
    fat: profile?.dailyCalories ? (profile.dailyCalories * 0.25) / 9 : 55, // 25% of calories from fat
  };

  // Calculate today's totals
  const todayTotals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate historical averages
  const historicalTotals = historicalMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const daysWithMeals = new Set(historicalMeals.map((m) => m.date)).size;
  const avgDaily = {
    calories: historicalTotals.calories / daysWithMeals,
    protein: historicalTotals.protein / daysWithMeals,
    carbs: historicalTotals.carbs / daysWithMeals,
    fat: historicalTotals.fat / daysWithMeals,
  };

  // Analyze needs
  if (todayTotals.calories < goals.calories * 0.7) {
    needs.push("calories");
  }
  if (todayTotals.protein < goals.protein * 0.7) {
    needs.push("protein");
  }
  if (todayTotals.carbs < goals.carbs * 0.7) {
    needs.push("carbs");
  }
  if (todayTotals.fat < goals.fat * 0.7) {
    needs.push("fat");
  }

  // Check historical patterns
  if (avgDaily.protein < goals.protein * 0.8) {
    needs.push("protein_habit");
  }
  if (avgDaily.calories < goals.calories * 0.8) {
    needs.push("calories_habit");
  }

  return { needs, goals };
}

function generateMealRecommendations(
  needs: string[],
  goals: { calories: number; protein: number; carbs: number; fat: number },
  todayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  },
  foodMacros: any[]
): MealRecommendation[] {
  const recommendations: MealRecommendation[] = [];
  const remainingCalories = goals.calories - todayTotals.calories;
  const remainingProtein = goals.protein - todayTotals.protein;
  const remainingCarbs = goals.carbs - todayTotals.carbs;
  const remainingFat = goals.fat - todayTotals.fat;

  // Filter and sort foods based on needs
  let filteredFoods = [...foodMacros];

  if (needs.includes("protein")) {
    filteredFoods = filteredFoods
      .filter((food) => food.protein > 15)
      .sort((a, b) => b.protein - a.protein);
    recommendations.push({
      name: filteredFoods[0].name,
      calories: filteredFoods[0].calories,
      protein: filteredFoods[0].protein,
      carbs: filteredFoods[0].carbs,
      fat: filteredFoods[0].fat,
      category: "protein",
      reason: `High in protein (${filteredFoods[0].protein}g) to help meet your daily goal`,
    });
  }

  if (needs.includes("calories")) {
    filteredFoods = filteredFoods
      .filter((food) => food.calories > 300)
      .sort((a, b) => b.calories - a.calories);
    recommendations.push({
      name: filteredFoods[0].name,
      calories: filteredFoods[0].calories,
      protein: filteredFoods[0].protein,
      carbs: filteredFoods[0].carbs,
      fat: filteredFoods[0].fat,
      category: "calories",
      reason: `Calorie-dense (${filteredFoods[0].calories} cal) to help reach your daily goal`,
    });
  }

  if (needs.includes("carbs")) {
    filteredFoods = filteredFoods
      .filter((food) => food.carbs > 30)
      .sort((a, b) => b.carbs - a.carbs);
    recommendations.push({
      name: filteredFoods[0].name,
      calories: filteredFoods[0].calories,
      protein: filteredFoods[0].protein,
      carbs: filteredFoods[0].carbs,
      fat: filteredFoods[0].fat,
      category: "carbs",
      reason: `Rich in carbohydrates (${filteredFoods[0].carbs}g) for energy`,
    });
  }

  if (needs.includes("fat")) {
    filteredFoods = filteredFoods
      .filter((food) => food.fat > 10)
      .sort((a, b) => b.fat - a.fat);
    recommendations.push({
      name: filteredFoods[0].name,
      calories: filteredFoods[0].calories,
      protein: filteredFoods[0].protein,
      carbs: filteredFoods[0].carbs,
      fat: filteredFoods[0].fat,
      category: "fat",
      reason: `Good source of healthy fats (${filteredFoods[0].fat}g)`,
    });
  }

  // Add balanced meal suggestions
  if (recommendations.length === 0) {
    const balancedFoods = foodMacros
      .filter((food) => food.protein > 10 && food.carbs > 20 && food.fat > 5)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    balancedFoods.forEach((food) => {
      recommendations.push({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: "balanced",
        reason:
          "Well-balanced meal with good amounts of protein, carbs, and healthy fats",
      });
    });
  }

  return recommendations;
}

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

// Define menu options and categories
const MENU_OPTIONS = {
  WORKOUT: {
    title: "🏋️ Workout Options",
    choices: [
      "get today's workout plan",
      "show my weekly workout schedule",
      "recommend a weight loss workout",
      "recommend a muscle gain workout",
      "show my workout progress",
      "check workout history",
      "suggest beginner workout",
      "suggest advanced workout",
    ],
  },
  NUTRITION: {
    title: "🍽️ Nutrition Options",
    choices: [
      "show today's meal plan",
      "check my calorie tracking",
      "recommend weight loss meals",
      "recommend muscle gain meals",
      "check my macro balance",
      "suggest meal timing",
      "show nutrition progress",
      "recommend healthy snacks",
    ],
  },
  PROGRESS: {
    title: "📈 Progress Tracking",
    choices: [
      "show my weekly progress",
      "check monthly progress",
      "check goal progress",
      "show workout history",
      "show nutrition history",
      "check weight progress",
      "show achievement stats",
    ],
  },
  PROFILE: {
    title: "👤 Profile Information",
    choices: [
      "show my current stats",
      "check weight goal",
      "check activity level",
      "show calorie goals",
      "show macro goals",
      "check workout preferences",
      "show my profile settings",
    ],
  },
  HELP: {
    title: "❓ Help & Support",
    choices: [
      "show all commands",
      "how to track workouts",
      "how to track meals",
      "how to check progress",
      "customize settings",
    ],
  },
};

// Define types for activity levels
type ActivityLevel =
  | "Sedentary"
  | "Lightly Active"
  | "Moderately Active"
  | "Very Active"
  | "Extremely Active";

// Define types for weight goals
type WeightGoal = "lose" | "maintain" | "gain";

// Add this interface after the imports
interface Profile {
  _id: Id<"profile">;
  _creationTime: number;
  weight?: number;
  height?: number;
  age?: number;
  bmr?: number;
  dailyCalories?: number;
  activityLevel?: ActivityLevel;
  gender?: "Male" | "Female" | "Other";
  userId: Id<"users">;
}

// Update the User interface to match the database schema
interface User {
  _id: Id<"users">;
  _creationTime: number;
  name: string;
  image?: string;
  subscriptionEndDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Add this helper function to format menu options
function formatMenuOptions(): string {
  let menuText = "📋 Available Commands\n\n";

  Object.entries(MENU_OPTIONS).forEach(([category, data]) => {
    menuText += data.title + "\n" + "--------------------\n";
    data.choices.forEach((choice, index) => {
      menuText += "* " + choice + "\n";
    });
    menuText += "\n";
  });

  menuText += "Tips:\n";
  menuText += "* You can use these commands exactly as shown\n";
  menuText += "* Type 'help' for more assistance\n";
  menuText += "* Type 'menu' to see this list again\n";

  return menuText;
}

// Update the getTimeBasedGreeting function with more natural responses
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Good night";
  }
}

// Update greeting patterns for more natural conversation
const GREETING_PATTERNS = {
  hello:
    /^(hi|hello|hey|greetings|sup|yo|what's up|whats up|howdy|hola|hey there|hi there)$/i,
  howAreYou:
    /^(how are you|how's it going|how are you doing|how do you do|what's up|whats up)$/i,
  goodMorning: /^(good morning|morning|gm|rise and shine)$/i,
  goodEvening: /^(good evening|evening|ge)$/i,
  goodNight: /^(good night|night|gn|sleep well)$/i,
  thanks: /^(thanks|thank you|thx|ty|appreciate it|much obliged)$/i,
  bye: /^(bye|goodbye|see you|see ya|farewell|take care|cya)$/i,
};

// Add a debug function to help verify the time
function getCurrentTimeDebug(): string {
  const now = new Date();
  return `Current time: ${now.toLocaleTimeString()}, Hour: ${now.getHours()}, Minutes: ${now.getMinutes()}`;
}

// Add menu trigger pattern
const MENU_TRIGGER =
  /^(menu|options|help|show menu|what can you do|commands)$/i;

// Modify the generateBotResponse function
export const generateBotResponse = mutation({
  args: {
    userId: v.id("users"),
    userMessage: v.string(),
    systemContext: v.optional(v.string()),
    presetResponse: v.optional(v.string()),
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

    // Get user profile data
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Get user data for name - Fix the user query to use the correct index
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();

    // Get the user's name from the database
    let userName = "there";
    if (user) {
      // Try to get the name from the user object
      const userData = user as any; // Temporarily use any to access the fields
      userName =
        userData.fullname ||
        userData.firstName ||
        userData.name ||
        userData.email?.split("@")[0] ||
        "there";
    }

    // Get recent workouts
    const recentWorkouts = await ctx.db
      .query("recentWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    // Get today's meals
    const today = new Date().toISOString().split("T")[0];
    const todayMeals = await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", today)
      )
      .collect();

    // Get historical data
    const lastMonth = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .split("T")[0];
    const historicalWorkouts = await ctx.db
      .query("exercise")
      .withIndex("by_user_day_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), lastMonth))
      .collect();

    const historicalMeals = await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), lastMonth))
      .collect();

    // Process the user's message and generate appropriate response
    let response = "";
    const message = userMessage.toLowerCase();

    // Handle menu trigger
    if (MENU_TRIGGER.test(message)) {
      response =
        "Here are the things I can help you with:\n\n" + formatMenuOptions();
    }
    // Handle greetings first
    else if (GREETING_PATTERNS.hello.test(message)) {
      const greeting = getTimeBasedGreeting();
      response = `${greeting}, ${userName}! 👋 I'm your fitness assistant. Type 'menu' to see what I can help you with.`;
    } else if (GREETING_PATTERNS.howAreYou.test(message)) {
      response = `I'm doing great, ${userName}! Ready to help you achieve your fitness goals. Type 'menu' to see what we can work on today.`;
    } else if (GREETING_PATTERNS.goodMorning.test(message)) {
      response = `Good morning, ${userName}! 🌅 Ready to start your day with some fitness? Type 'menu' to see your options.`;
    } else if (GREETING_PATTERNS.goodEvening.test(message)) {
      response = `Good evening, ${userName}! 🌙 Great time to plan tomorrow's fitness activities. Type 'menu' to see your options.`;
    } else if (GREETING_PATTERNS.goodNight.test(message)) {
      response = `Good night, ${userName}! 🌠 Rest well and I'll be here to help you with your fitness goals tomorrow.`;
    } else if (GREETING_PATTERNS.thanks.test(message)) {
      response = `You're welcome, ${userName}! 😊 Happy to help you on your fitness journey.`;
    } else if (GREETING_PATTERNS.bye.test(message)) {
      response = `Take care, ${userName}! 👋 Remember, consistency is key to achieving your fitness goals.`;
    }
    // Handle workout options
    else if (
      MENU_OPTIONS.WORKOUT.choices.some((choice) =>
        message.includes(choice.toLowerCase())
      )
    ) {
      if (!profile) {
        response = `Hey ${userName}, I'd love to give you personalized workout recommendations! Could you please complete your profile first?`;
      } else {
        const { plan, exercises } = getGoalBasedWorkoutPlan(
          profile,
          historicalWorkouts
        );
        response = `Here's your personalized workout plan, ${userName}:\n\n${plan}\n\nRecommended Exercises:\n`;
        exercises.forEach((exercise) => {
          response +=
            `- ${exercise.name}\n` +
            `  Duration: ${exercise.duration} minutes\n` +
            `  Calories Burned: ~${exercise.caloriesBurned}\n` +
            `  Type: ${exercise.type}\n\n`;
        });

        // Add complementary meal suggestions
        response += `\n🍽️ Here are some meal suggestions to complement your workout, ${userName}:\n`;
        const mealRecommendations = getGoalBasedMealPlan(profile, [], {
          calories: profile.dailyCalories,
        });
        mealRecommendations.forEach((meal) => {
          response +=
            `- ${meal.name}\n` +
            `  Calories: ${meal.calories}\n` +
            `  Protein: ${meal.protein}g\n` +
            `  Carbs: ${meal.carbs}g\n` +
            `  Fat: ${meal.fat}g\n` +
            `  Why: ${meal.reason}\n\n`;
        });
      }
    }
    // Handle nutrition options
    else if (
      MENU_OPTIONS.NUTRITION.choices.some((choice) =>
        message.includes(choice.toLowerCase())
      )
    ) {
      if (!profile) {
        response = `Hi ${userName}! To give you the best meal recommendations, I'll need your profile information. Could you please set that up?`;
      } else {
        const { needs, goals } = analyzeNutritionalNeeds(
          profile,
          historicalMeals,
          todayMeals,
          null
        );
        const mealRecommendations = getGoalBasedMealPlan(profile, needs, goals);

        response = `Here are your personalized meal recommendations, ${userName}:\n\n`;
        mealRecommendations.forEach((rec) => {
          response +=
            `- ${rec.name}\n` +
            `  Calories: ${rec.calories}\n` +
            `  Protein: ${rec.protein}g\n` +
            `  Carbs: ${rec.carbs}g\n` +
            `  Fat: ${rec.fat}g\n` +
            `  Why: ${rec.reason}\n\n`;
        });

        // Add complementary workout suggestions
        response += `\n💪 And here are some workout suggestions to complement your meals, ${userName}:\n`;
        const { exercises } = getGoalBasedWorkoutPlan(
          profile,
          historicalWorkouts
        );
        exercises.forEach((exercise) => {
          response += `- ${exercise.name} (${exercise.duration} mins)\n`;
        });
      }
    }
    // Handle progress options
    else if (
      MENU_OPTIONS.PROGRESS.choices.some((choice) =>
        message.includes(choice.toLowerCase())
      )
    ) {
      if (historicalWorkouts.length === 0 && historicalMeals.length === 0) {
        response = `Hey ${userName}! I don't see any progress data yet. Let's start tracking your workouts and meals to see your amazing progress!`;
      } else {
        response = `Here's your progress report, ${userName}:\n\n`;

        // Workout progress
        if (historicalWorkouts.length > 0) {
          const totalWorkouts = historicalWorkouts.length;
          const totalCaloriesBurned = historicalWorkouts.reduce(
            (sum, ex) => sum + ex.caloriesBurned,
            0
          );
          const workoutTypes = new Set(historicalWorkouts.map((ex) => ex.type));

          response +=
            "Workout Progress:\n" +
            `- Total workouts: ${totalWorkouts}\n` +
            `- Total calories burned: ${totalCaloriesBurned}\n` +
            `- Types of workouts: ${Array.from(workoutTypes).join(", ")}\n\n`;
        }

        // Nutrition progress
        if (historicalMeals.length > 0) {
          const avgCalories =
            historicalMeals.reduce((sum, meal) => sum + meal.calories, 0) /
            new Set(historicalMeals.map((m) => m.date)).size;

          response +=
            "Nutrition Progress:\n" +
            `- Average daily calories: ${Math.round(avgCalories)}\n` +
            `- Most common meal types: ${getMostCommonMealTypes(historicalMeals)}\n`;
        }
      }
    }
    // Handle profile options
    else if (
      MENU_OPTIONS.PROFILE.choices.some((choice) =>
        message.includes(choice.toLowerCase())
      )
    ) {
      if (profile) {
        response =
          `Here's your profile information, ${userName}:\n\n` +
          `- Weight: ${profile.weight || "Not set"} kg\n` +
          `- Height: ${profile.height || "Not set"} cm\n` +
          `- Age: ${profile.age || "Not set"} years\n` +
          `- Activity Level: ${profile.activityLevel || "Not set"}\n` +
          `- Daily Calorie Goal: ${profile.dailyCalories || "Not set"} calories\n` +
          `- BMR: ${profile.bmr || "Not set"} calories`;
      } else {
        response = `Hi ${userName}! I don't see your profile information yet. Let's set that up so I can give you personalized recommendations!`;
      }
    }
    // Default response for unrecognized input
    else {
      response = `I'm not sure what you're asking for, ${userName}. Type 'menu' to see what I can help you with.`;
    }

    // Store the bot's response
    await ctx.db.insert("chatMessages", {
      userId,
      content: response,
      isUserMessage: false,
      timestamp: new Date().toISOString(),
    });

    return response;
  },
});

// Helper function to get most common meal types
function getMostCommonMealTypes(meals: any[]): string {
  const mealTypes = meals.map((m) => m.mealType);
  const counts: Record<string, number> = mealTypes.reduce(
    (acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type)
    .join(", ");
}

// Update the getGoalBasedWorkoutPlan function
function getGoalBasedWorkoutPlan(
  profile: Profile,
  historicalWorkouts: any[]
): { plan: string; exercises: Exercise[] } {
  // Determine weight goal based on profile data
  let weightGoal: WeightGoal = "maintain";
  if (profile?.weight && profile?.dailyCalories) {
    // If daily calories are significantly lower than BMR, assume weight loss goal
    if (profile.dailyCalories < (profile.bmr || 2000) * 0.8) {
      weightGoal = "lose";
    }
    // If daily calories are significantly higher than BMR, assume weight gain goal
    else if (profile.dailyCalories > (profile.bmr || 2000) * 1.2) {
      weightGoal = "gain";
    }
  }

  const currentWeight = profile?.weight || 70;
  const activityLevel = (profile?.activityLevel ||
    "Moderately Active") as ActivityLevel;

  let plan = "";
  let exercises: Exercise[] = [];

  // Determine workout intensity based on activity level
  const intensity = {
    Sedentary: 0.8,
    "Lightly Active": 0.9,
    "Moderately Active": 1.0,
    "Very Active": 1.1,
    "Extremely Active": 1.2,
  }[activityLevel];

  // Get workout frequency based on historical data
  const workoutFrequency =
    new Set(historicalWorkouts.map((w) => w.date)).size / 30; // workouts per month
  const recommendedFrequency =
    workoutFrequency < 0.3
      ? "beginner"
      : workoutFrequency < 0.6
        ? "intermediate"
        : "advanced";

  // Use type-safe comparison for weight goal
  switch (weightGoal) {
    case "lose":
      plan =
        `Weight Loss Workout Plan (${recommendedFrequency} level):\n` +
        `Focus: High-intensity cardio and strength training to maximize calorie burn and maintain muscle mass.\n\n`;

      exercises = [
        {
          name: "HIIT Cardio",
          type: "cardio",
          duration: 30,
          caloriesBurned: Math.round(300 * intensity),
        },
        {
          name: "Full Body Strength Circuit",
          type: "strength",
          duration: 45,
          caloriesBurned: Math.round(250 * intensity),
        },
        {
          name: "Core Workout",
          type: "strength",
          duration: 20,
          caloriesBurned: Math.round(150 * intensity),
        },
      ];
      break;

    case "gain":
      plan =
        `Muscle Gain Workout Plan (${recommendedFrequency} level):\n` +
        `Focus: Progressive overload and compound movements to build muscle mass.\n\n`;

      exercises = [
        {
          name: "Heavy Compound Lifts",
          type: "strength",
          duration: 45,
          caloriesBurned: Math.round(200 * intensity),
        },
        {
          name: "Isolation Exercises",
          type: "strength",
          duration: 30,
          caloriesBurned: Math.round(150 * intensity),
        },
        {
          name: "Light Cardio",
          type: "cardio",
          duration: 20,
          caloriesBurned: Math.round(100 * intensity),
        },
      ];
      break;

    default: // maintain
      plan =
        `Maintenance Workout Plan (${recommendedFrequency} level):\n` +
        `Focus: Balanced mix of strength, cardio, and flexibility for overall fitness.\n\n`;

      exercises = [
        {
          name: "Moderate Cardio",
          type: "cardio",
          duration: 30,
          caloriesBurned: Math.round(200 * intensity),
        },
        {
          name: "Full Body Strength",
          type: "strength",
          duration: 40,
          caloriesBurned: Math.round(180 * intensity),
        },
        {
          name: "Flexibility Training",
          type: "flexibility",
          duration: 20,
          caloriesBurned: Math.round(100 * intensity),
        },
      ];
  }

  return { plan, exercises };
}

function getGoalBasedMealPlan(
  profile: any,
  needs: string[],
  goals: any
): MealRecommendation[] {
  const weightGoal = profile?.weightGoal || "maintain";
  const currentWeight = profile?.weight || 70;
  const activityLevel = profile?.activityLevel || "moderate";

  let recommendations: MealRecommendation[] = [];
  const calorieDeficit =
    weightGoal === "lose" ? 500 : weightGoal === "gain" ? -500 : 0;
  const adjustedCalories = goals.calories + calorieDeficit;

  // Base recommendations on weight goal
  if (weightGoal === "lose") {
    recommendations.push({
      name: "High-Protein Salad Bowl",
      calories: 400,
      protein: 35,
      carbs: 25,
      fat: 15,
      category: "weight_loss",
      reason:
        "Low-calorie, high-protein meal to support fat loss while maintaining muscle",
    });
    recommendations.push({
      name: "Grilled Chicken with Vegetables",
      calories: 450,
      protein: 40,
      carbs: 30,
      fat: 12,
      category: "weight_loss",
      reason: "Lean protein with fiber-rich vegetables for satiety",
    });
  } else if (weightGoal === "gain") {
    recommendations.push({
      name: "Protein-Packed Smoothie Bowl",
      calories: 600,
      protein: 30,
      carbs: 70,
      fat: 20,
      category: "muscle_gain",
      reason: "Calorie-dense meal with balanced macros for muscle growth",
    });
    recommendations.push({
      name: "Steak with Sweet Potato",
      calories: 700,
      protein: 45,
      carbs: 60,
      fat: 25,
      category: "muscle_gain",
      reason: "High-protein meal with complex carbs for energy and recovery",
    });
  } else {
    recommendations.push({
      name: "Balanced Buddha Bowl",
      calories: 500,
      protein: 25,
      carbs: 45,
      fat: 20,
      category: "maintenance",
      reason: "Well-balanced meal with all essential nutrients",
    });
    recommendations.push({
      name: "Mediterranean Plate",
      calories: 550,
      protein: 30,
      carbs: 50,
      fat: 22,
      category: "maintenance",
      reason: "Heart-healthy meal with good balance of macros",
    });
  }

  return recommendations;
}
