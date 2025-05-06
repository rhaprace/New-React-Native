import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function for consistent day formatting
function formatDayConsistently(day: string): string {
  if (!day) return '';

  // Normalize the day name by removing any extra spaces and converting to lowercase
  const normalizedDay = day.trim().toLowerCase();

  // Map of possible day variations to standard format
  const dayMap: Record<string, string> = {
    'mon': 'Monday',
    'monday': 'Monday',
    'tue': 'Tuesday',
    'tues': 'Tuesday',
    'tuesday': 'Tuesday',
    'wed': 'Wednesday',
    'weds': 'Wednesday',
    'wednesday': 'Wednesday',
    'thu': 'Thursday',
    'thur': 'Thursday',
    'thurs': 'Thursday',
    'thursday': 'Thursday',
    'fri': 'Friday',
    'friday': 'Friday',
    'sat': 'Saturday',
    'saturday': 'Saturday',
    'sun': 'Sunday',
    'sunday': 'Sunday',
  };

  // Check if the normalized day is in our map
  if (dayMap[normalizedDay]) {
    return dayMap[normalizedDay];
  }

  // If not in the map, use the standard capitalization approach
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

// Helper functions to reduce code duplication
async function findExistingMeal(ctx: any, userId: any, date: string, name: string, mealType: string) {
  return await ctx.db
    .query("meal")
    .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
    .filter((q: any) => q.eq(q.field("name"), name) && q.eq(q.field("mealType"), mealType))
    .first();
}

async function findExistingAddedMeal(ctx: any, userId: any, date: string, mealName: string, mealType: string) {
  return await ctx.db
    .query("addedMeals")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) =>
      q.eq(q.field("mealName"), mealName) &&
      q.eq(q.field("mealType"), mealType) &&
      q.eq(q.field("date"), date)
    )
    .first();
}

// Create a new meal
export const createMeal = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    date: v.string(),
    day: v.string(),
    mealType: v.string()
  },
  handler: async (ctx, args) => {
    const existingMeal = await findExistingMeal(ctx, args.userId, args.date, args.name, args.mealType);

    if (existingMeal) {
      return { status: "exists", mealId: existingMeal._id, duplicate: true };
    }

    // Ensure day is properly formatted using our consistent helper
    const formattedDay = formatDayConsistently(args.day);

    // Create a new meal with the formatted day
    const mealId = await ctx.db.insert("meal", {
      ...args,
      day: formattedDay
    });

    return { status: "created", mealId, duplicate: false };
  },
});

// Log an added meal
export const logAddedMeal = mutation({
  args: {
    userId: v.id("users"),
    mealName: v.string(),
    mealType: v.string(),
    day: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existingMeal = await findExistingAddedMeal(ctx, args.userId, args.date, args.mealName, args.mealType);

    if (existingMeal) {
      return { success: true, mealLogId: existingMeal._id, duplicate: true };
    }

    // Ensure day is properly formatted using our consistent helper
    const formattedDay = formatDayConsistently(args.day);

    // Create a new meal log with the formatted day
    const mealLogId = await ctx.db.insert("addedMeals", {
      ...args,
      day: formattedDay
    });

    return { success: true, mealLogId, duplicate: false };
  },
});

// Save a recommended food
export const saveRumbleFoodRecommendation = mutation({
  args: {
    userId: v.id("users"),
    foodId: v.string(),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    category: v.string(),
    day: v.string(),
    date: v.string(),
    mealType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mealTypeToUse = args.mealType || "Snack";
    const mealNameWithLabel = `${args.name} (Rumble Food)`;

    // Check for existing entries
    const existingMeal = await findExistingAddedMeal(ctx, args.userId, args.date, mealNameWithLabel, mealTypeToUse);
    const existingMealEntry = await findExistingMeal(ctx, args.userId, args.date, args.name, mealTypeToUse);

    // Ensure day is properly formatted using our consistent helper
    const formattedDay = formatDayConsistently(args.day);
    console.log(`Saving recommendation for day: ${args.day} -> formatted as: ${formattedDay}`);

    // Insert or use existing meal log
    const mealLogId = existingMeal
      ? existingMeal._id
      : await ctx.db.insert("addedMeals", {
          userId: args.userId,
          mealName: mealNameWithLabel,
          mealType: mealTypeToUse,
          day: formattedDay,
          date: args.date,
        });

    // Insert or use existing meal entry
    const mealId = existingMealEntry
      ? existingMealEntry._id
      : await ctx.db.insert("meal", {
          userId: args.userId,
          name: args.name,
          calories: args.calories,
          protein: args.protein,
          carbs: args.carbs,
          fat: args.fat,
          date: args.date,
          day: formattedDay,
          mealType: mealTypeToUse,
        });

    return {
      success: true,
      mealLogId,
      mealId,
      duplicate: existingMeal !== null || existingMealEntry !== null
    };
  },
});

// Update an existing meal
export const updateMeal = mutation({
  args: {
    mealId: v.id("meal"),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  },
  handler: async (ctx, args) => {
    const { mealId, ...updateFields } = args;
    const existingMeal = await ctx.db.get(mealId);

    if (!existingMeal) {
      throw new Error("Meal not found");
    }

    await ctx.db.patch(mealId, updateFields);
    return { success: true, mealId };
  },
});

// Delete a meal
export const deleteMeal = mutation({
  args: {
    mealId: v.id("meal"),
  },
  handler: async (ctx, args) => {
    const existingMeal = await ctx.db.get(args.mealId);

    if (!existingMeal) {
      throw new Error("Meal not found");
    }

    await ctx.db.delete(args.mealId);
    return { success: true };
  },
});

// Get meals by date
export const getMealsByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .collect();
  },
});

// Get all meals for a user (for meal planning)
export const getAllMeals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const meals = await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .collect();

    // Standardize day formatting for all meals
    const formattedMeals = meals.map(meal => {
      // Ensure day is properly formatted using our consistent helper
      if (meal.day) {
        const formattedDay = formatDayConsistently(meal.day);
        return { ...meal, day: formattedDay };
      }
      return meal;
    });

    // Log the number of meals found for each day to help with debugging
    const mealsByDay = formattedMeals.reduce<Record<string, typeof formattedMeals>>((acc, meal) => {
      const day = meal.day || '';
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(meal);
      return acc;
    }, {});

    console.log("Meals by day:", Object.keys(mealsByDay).map(day => ({
      day,
      count: mealsByDay[day]?.length || 0
    })));

    return formattedMeals;
  },
});

// Get meal history by date range
export const getMealHistoryByDateRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all meals within the date range
    const meals = await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.gte(q.field("date"), args.startDate),
        q.lte(q.field("date"), args.endDate)
      ))
      .collect();

    // Define interface for meal summary
    interface DailyMealSummary {
      date: string;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      meals: any[];
    }

    // Group and summarize meals by date
    const mealsByDate = meals.reduce<Record<string, DailyMealSummary>>((acc, meal) => {
      const { date } = meal;

      if (!acc[date]) {
        acc[date] = {
          date,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          meals: []
        };
      }

      // Add meal data to summary
      acc[date].totalCalories += meal.calories;
      acc[date].totalProtein += meal.protein;
      acc[date].totalCarbs += meal.carbs;
      acc[date].totalFat += meal.fat;
      acc[date].meals.push(meal);

      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(mealsByDate).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },
});
export const seedFoodMacros = internalMutation({
  handler: async (ctx) => {
    return await seedFoodMacrosHelper(ctx);
  },
});
export const seedFoodMacrosPublic = mutation({
  handler: async (ctx) => {
    return await seedFoodMacrosHelper(ctx);
  },
});
async function seedFoodMacrosHelper(ctx: any) {
  const foodItems = [
    // Protein sources
    { name: "chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "salmon fillet", calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: "beef", calories: 250, protein: 26, carbs: 0, fat: 17 },
    { name: "pork", calories: 242, protein: 26, carbs: 0, fat: 16 },
    { name: "tuna", calories: 184, protein: 40, carbs: 0, fat: 1 },
    { name: "egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
    { name: "turkey breast", calories: 135, protein: 30, carbs: 0, fat: 1.5 },
    { name: "shrimp", calories: 99, protein: 24, carbs: 0, fat: 0.3 },
    { name: "tofu", calories: 144, protein: 17, carbs: 3, fat: 8.7 },
    { name: "greek yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.4 },
    { name: "cottage cheese", calories: 120, protein: 14, carbs: 3, fat: 5 },
    { name: "whey protein", calories: 120, protein: 24, carbs: 3, fat: 2 },

    // Carbohydrate sources
    { name: "rice", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { name: "sweet potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    { name: "oatmeal", calories: 150, protein: 5, carbs: 27, fat: 2.5 },
    { name: "pasta", calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
    { name: "bread", calories: 265, protein: 9, carbs: 49, fat: 3.2 },
    { name: "potato", calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    { name: "quinoa", calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
    { name: "brown rice", calories: 112, protein: 2.6, carbs: 23, fat: 0.9 },
    { name: "whole wheat bread", calories: 81, protein: 4, carbs: 13.8, fat: 1.1 },
    { name: "corn", calories: 96, protein: 3.4, carbs: 21, fat: 1.5 },
    { name: "barley", calories: 123, protein: 2.3, carbs: 28, fat: 0.4 },

    // Fruits
    { name: "banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: "orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
    { name: "strawberries", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
    { name: "blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
    { name: "mango", calories: 99, protein: 1.4, carbs: 24.7, fat: 0.6 },
    { name: "pineapple", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
    { name: "grapes", calories: 69, protein: 0.6, carbs: 18, fat: 0.2 },
    { name: "watermelon", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
    { name: "kiwi", calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5 },

    // Vegetables
    { name: "broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
    { name: "spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    { name: "kale", calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9 },
    { name: "carrots", calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
    { name: "bell pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3 },
    { name: "cucumber", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
    { name: "tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    { name: "lettuce", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
    { name: "cauliflower", calories: 25, protein: 2, carbs: 5, fat: 0.1 },
    { name: "zucchini", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
    { name: "asparagus", calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },

    // Dairy and alternatives
    { name: "milk", calories: 149, protein: 7.7, carbs: 11.7, fat: 8 },
    { name: "yogurt", calories: 150, protein: 12, carbs: 17, fat: 3.8 },
    { name: "cheese", calories: 402, protein: 25, carbs: 2.4, fat: 33 },
    { name: "almond milk", calories: 39, protein: 1.5, carbs: 3.5, fat: 2.5 },
    { name: "soy milk", calories: 80, protein: 7, carbs: 4, fat: 4 },
    { name: "oat milk", calories: 120, protein: 3, carbs: 16, fat: 5 },
    { name: "coconut milk", calories: 230, protein: 2.3, carbs: 6.4, fat: 24 },

    // Healthy fats
    { name: "avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    { name: "olive oil", calories: 119, protein: 0, carbs: 0, fat: 13.5 },
    { name: "almonds", calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: "walnuts", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5 },
    { name: "chia seeds", calories: 138, protein: 4.7, carbs: 12, fat: 8.7 },
    { name: "flax seeds", calories: 150, protein: 5.2, carbs: 8, fat: 12 },
    { name: "peanut butter", calories: 188, protein: 8, carbs: 6, fat: 16 },
    { name: "coconut oil", calories: 121, protein: 0, carbs: 0, fat: 13.5 },

    // Prepared foods
    { name: "protein bar", calories: 200, protein: 20, carbs: 20, fat: 5 },
    { name: "protein shake", calories: 150, protein: 25, carbs: 5, fat: 2 },
    { name: "granola", calories: 120, protein: 3, carbs: 18, fat: 6 },
    { name: "hummus", calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6 },
    { name: "trail mix", calories: 173, protein: 5, carbs: 12, fat: 12 },

    // Breakfast Recipes
    {name: "Egg and Bacon Mi-Muffin", calories: 333, protein: 24, carbs: 30, fat: 13},
    {name: "Protein Rich PB Brownie Muffins", calories: 70, protein: 6, carbs: 7, fat: 2},
    {name: "Simple Overnight Oats", calories: 115, protein: 8, carbs: 16, fat: 2},
    {name: "Macro Friendly French Toast", calories: 170, protein: 12, carbs: 18, fat: 5.5},
    {name: "Cinnamon Roll Oats Mug Cake", calories: 170, protein: 15, carbs: 20, fat: 3},
    {name: "High Fiber Zoats", calories: 115, protein: 8.5, carbs: 16, fat: 1.5},
    {name: "Banana Chocolate Chip Muffins", calories: 95, protein: 7, carbs: 12, fat: 2},
    {name: "Fluffy Protein Waffles ", calories: 225, protein: 20, carbs: 25, fat: 5},
    {name: "Turkey and Broccoli Omelet ", calories: 397, protein: 35, carbs: 26, fat: 17},
    {name: "Strawberries and Cream Overnight Oatmeal", calories: 282, protein: 30, carbs: 27, fat: 6},

    // Lunch Recipes
    {name: "Chicken Salad", calories: 470, protein: 21, carbs: 47, fat: 22},
    {name: "Philly CheesesSteak Pita", calories: 310, protein: 23, carbs: 25, fat: 13},
    {name: "Lemon Ricotta Pasta", calories: 477, protein: 22, carbs: 68, fat: 13},
    {name: " Macro-Friendly Apple Pecan Salad", calories: 315, protein: 25, carbs: 18, fat: 16},
    {name: "Philly Cheesesteak Stuffed Peppers", calories: 350, protein: 25, carbs: 25, fat: 15},
    {name: "BBQ Pulled Pork", calories: 70, protein: 12, carbs: 2.5, fat: 1},
    {name: "Low-Fat Monte Cristo", calories: 290, protein: 25, carbs: 30, fat: 8},
    {name: "Tasty Tuna Grain Bowl", calories: 392, protein: 23, carbs: 48, fat: 12},
    {name: "Hit-The-Spot Mini Pepperoni Pizza", calories: 107, protein: 7, carbs: 13, fat: 3},
    {name: "Rotisserie Chicken Salad", calories: 470, protein: 21, carbs: 47, fat: 22},
    {name: "Tuna Poke Bowl", calories: 485, protein: 40, carbs: 43, fat: 17},

    // Dinner Recipes
    {name: "Tortilla Pizza", calories: 460, protein: 30, carbs: 58, fat: 12},
    {name: "Mozzarella Chicken", calories: 289, protein: 41, carbs: 11, fat: 9},
    {name: "Chicken Enchiladas", calories: 180, protein: 17, carbs: 14, fat: 6},
    {name: "Low Fat Spicy Cabbage with Ground Turkey", calories: 378, protein: 50, carbs: 22, fat: 10},
    {name: "Bursting with Goodness Burrito Bowl", calories: 646, protein: 49, carbs: 54, fat: 26},
    {name: "Taco Tuesday Turkey Salad", calories: 470, protein: 36, carbs: 21, fat: 27},
  ];

  const existingItems = await ctx.db.query("foodMacros").collect();
  if (existingItems.length > 0) {
    const existingItemsMap = new Map();
    existingItems.forEach((item: any) => {
      existingItemsMap.set(item.name, item);
    });

    const newItems = [];
    const updatedItems = [];
    for (const food of foodItems) {
      const existingItem = existingItemsMap.get(food.name);

      if (!existingItem) {
        newItems.push(food);
      } else {
        const needsUpdate =
          existingItem.calories !== food.calories ||
          existingItem.protein !== food.protein ||
          existingItem.carbs !== food.carbs ||
          existingItem.fat !== food.fat;

        if (needsUpdate) {
          updatedItems.push({
            id: existingItem._id,
            ...food
          });
        }
      }
    }
    const insertedIds = [];
    for (const food of newItems) {
      const id = await ctx.db.insert("foodMacros", food);
      insertedIds.push(id);
    }
    for (const food of updatedItems) {
      const { id, ...updateData } = food;
      await ctx.db.patch(id, updateData);
    }

    if (newItems.length > 0 || updatedItems.length > 0) {
      return {
        status: "updated",
        message: `Added ${newItems.length} new food items and updated ${updatedItems.length} existing items`,
        insertedIds,
        updatedCount: updatedItems.length
      };
    }

    return { status: "skipped", message: "Food data already exists and is up to date" };
  }
  const insertedIds = [];
  for (const food of foodItems) {
    const id = await ctx.db.insert("foodMacros", food);
    insertedIds.push(id);
  }

  return { status: "success", count: foodItems.length, ids: insertedIds };
}
