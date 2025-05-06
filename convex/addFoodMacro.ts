import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Define interfaces for food data
interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
}

interface FoodUpdateData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
}

export const addFoodMacro = mutation({
  args: {
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    forceUpdate: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, calories, protein, carbs, fat, forceUpdate = false, category } = args;

    if (!name || name.trim() === "") {
      throw new Error("Food name cannot be empty");
    }
    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
      throw new Error("Macronutrient values cannot be negative");
    }
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    const caloriesDifference = Math.abs(calculatedCalories - calories);
    let macroWarning = null;
    if (caloriesDifference > 50) {
      macroWarning = `Warning: The provided calories (${calories}) differ significantly from calculated calories (${calculatedCalories.toFixed(0)}) based on macros.`;
    }

    const normalizedName = name.toLowerCase().trim();
    let existingFood = await ctx.db
      .query("foodMacros")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .first();

    if (!existingFood && !forceUpdate) {
      const allFoods = await ctx.db.query("foodMacros").collect();
      const similarFood = allFoods.find(food => {
        return food.name.includes(normalizedName) || normalizedName.includes(food.name);
      });

      if (similarFood) {
        existingFood = similarFood;
      }
    }

    if (existingFood) {
      if (forceUpdate) {
        const updateData: FoodUpdateData = {
          calories,
          protein,
          carbs,
          fat
        };
        if (category) {
          updateData.category = category;
        }

        await ctx.db.patch(existingFood._id, updateData);

        return {
          success: true,
          message: `Food "${existingFood.name}" updated successfully`,
          foodId: existingFood._id,
          warning: macroWarning
        };
      }

      return {
        success: false,
        message: `A similar food "${existingFood.name}" already exists in the database. Use forceUpdate=true to update it.`,
        foodId: existingFood._id
      };
    }
    const foodData: FoodData = {
      name: normalizedName,
      calories,
      protein,
      carbs,
      fat
    };

    if (category) {
      foodData.category = category;
    }

    const foodId = await ctx.db.insert("foodMacros", foodData);

    return {
      success: true,
      message: "Food added successfully to the storage",
      foodId,
      warning: macroWarning
    };
  }
});

export const bulkAddFoodMacros = mutation({
  args: {
    foods: v.array(
      v.object({
        name: v.string(),
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number(),
        category: v.optional(v.string()),
      })
    ),
    skipExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { foods, skipExisting = true } = args;
    const results = [];

    for (const food of foods) {
      const { name, calories, protein, carbs, fat, category } = food;

      if (!name || name.trim() === "") {
        results.push({
          name,
          success: false,
          message: "Food name cannot be empty"
        });
        continue;
      }

      const normalizedName = name.toLowerCase().trim();

      const existingFood = await ctx.db
        .query("foodMacros")
        .withIndex("by_name", (q) => q.eq("name", normalizedName))
        .first();

      if (existingFood) {
        if (skipExisting) {
          results.push({
            name: normalizedName,
            success: false,
            message: `Food "${normalizedName}" already exists, skipping`,
            foodId: existingFood._id
          });
          continue;
        } else {

          const updateData: FoodUpdateData = {
            calories,
            protein,
            carbs,
            fat
          };

          if (category) {
            updateData.category = category;
          }

          await ctx.db.patch(existingFood._id, updateData);

          results.push({
            name: normalizedName,
            success: true,
            message: `Food "${normalizedName}" updated successfully`,
            foodId: existingFood._id
          });
          continue;
        }
      }

      const foodData: FoodData = {
        name: normalizedName,
        calories,
        protein,
        carbs,
        fat
      };

      if (category) {
        foodData.category = category;
      }

      const foodId = await ctx.db.insert("foodMacros", foodData);

      results.push({
        name: normalizedName,
        success: true,
        message: `Food "${normalizedName}" added successfully`,
        foodId
      });
    }

    return {
      success: true,
      results
    };
  }
});
