import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addCustomMeal = mutation({
  args: {
    userId: v.id("users"),
    mealName: v.string(),
    mealType: v.string(),
    grams: v.number(),
    day: v.string(),
    date: v.string(),
    foodMacros: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, mealName, mealType, grams, day, date } = args;
    const foodCount = await ctx.db.query("foodMacros").collect();
    if (foodCount.length === 0) {
      throw new Error(
        "No food items found in the database. Please add some foods first."
      );
    }
    const normalizedMealName = mealName.toLowerCase().trim();
    let foodItem = await ctx.db
      .query("foodMacros")
      .withIndex("by_name", (q) => q.eq("name", normalizedMealName))
      .first();
    if (!foodItem) {
      const simplifiedName = normalizedMealName.replace(/[^a-z0-9]/g, "");
      const allFoodItems = await ctx.db.query("foodMacros").collect();

      if (allFoodItems.length === 0) {
        throw new Error(
          "No food items found in the database. Please add some foods first."
        );
      }
      const partialMatches = allFoodItems.filter((item) => {
        const itemSimplified = item.name.replace(/[^a-z0-9]/g, "");
        return (
          itemSimplified.includes(simplifiedName) ||
          simplifiedName.includes(itemSimplified) ||
          item.name.includes(normalizedMealName) ||
          normalizedMealName.includes(item.name)
        );
      });

      if (partialMatches.length > 0) {
        foodItem = partialMatches[0];
      } else {
        const availableFoods = allFoodItems.map((item) => item.name).join(", ");
        throw new Error(
          `Meal "${mealName}" not found in the database. Available options: ${availableFoods}`
        );
      }
    }

    const multiplier = grams / 100;
    const calories = Math.round(foodItem.calories * multiplier);
    const protein = Math.round(foodItem.protein * multiplier);
    const carbs = Math.round(foodItem.carbs * multiplier);
    const fat = Math.round(foodItem.fat * multiplier);
    const existingMeal = await ctx.db
      .query("meal")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .filter(
        (q) =>
          q.eq(q.field("name"), mealName) && q.eq(q.field("mealType"), mealType)
      )
      .first();

    // Ensure day is properly formatted (first letter capitalized)
    const formattedDay =
      day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    let mealId;
    if (existingMeal) {
      mealId = existingMeal._id;
    } else {
      mealId = await ctx.db.insert("meal", {
        userId,
        name: mealName,
        calories,
        protein,
        carbs,
        fat,
        date,
        mealType,
        day: formattedDay,
      });
    }
    const existingAddedMeal = await ctx.db
      .query("addedMeals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(
        (q) =>
          q.eq(q.field("mealName"), mealName) &&
          q.eq(q.field("mealType"), mealType) &&
          q.eq(q.field("date"), date)
      )
      .first();

    let mealLogId;
    if (existingAddedMeal) {
      mealLogId = existingAddedMeal._id;
    } else {
      mealLogId = await ctx.db.insert("addedMeals", {
        userId,
        mealName,
        mealType,
        day: formattedDay,
        date,
      });
    }

    const isDuplicate = existingMeal !== null || existingAddedMeal !== null;

    return {
      success: true,
      message: isDuplicate
        ? "Meal already exists, using existing entry"
        : "Custom meal added successfully!",
      mealId,
      mealLogId,
      duplicate: isDuplicate,
      mealData: {
        name: mealName,
        calories,
        protein,
        carbs,
        fat,
        date,
        day: formattedDay,
        mealType,
      },
    };
  },
});
