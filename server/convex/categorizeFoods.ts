import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

function categorizeFood(food: any): string {
  const { protein, carbs, fat } = food;

  const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);

  if (totalCalories === 0) return "other";

  const proteinPercentage = (protein * 4) / totalCalories;
  const carbsPercentage = (carbs * 4) / totalCalories;
  const fatPercentage = (fat * 9) / totalCalories;

  if (proteinPercentage >= 0.4) {
    return "protein";
  } else if (carbsPercentage >= 0.5) {
    return "carbs";
  } else if (fatPercentage >= 0.5) {
    return "fat";
  } else {
    return "balanced";
  }
}
async function categorizeAllFoodsHelper(ctx: any) {
  const foods = await ctx.db.query("foodMacros").collect();
  const results = [];

  for (const food of foods) {
    if (food.category) {
      results.push({
        name: food.name,
        category: food.category,
        status: "skipped"
      });
      continue;
    }

    const category = categorizeFood(food);
    await ctx.db.patch(food._id, { category });

    results.push({
      name: food.name,
      category,
      status: "updated"
    });
  }

  return {
    success: true,
    count: foods.length,
    updated: results.filter(r => r.status === "updated").length,
    skipped: results.filter(r => r.status === "skipped").length,
    results
  };
}
export const categorizeAllFoods = internalMutation({
  handler: async (ctx) => {
    return await categorizeAllFoodsHelper(ctx);
  }
});
export const categorizeAllFoodsPublic = mutation({
  handler: async (ctx) => {
    return await categorizeAllFoodsHelper(ctx);
  }
});

export const setCategoryForFood = mutation({
  args: {
    foodId: v.id("foodMacros"),
    category: v.string()
  },
  handler: async (ctx, args) => {
    const { foodId, category } = args;

    const food = await ctx.db.get(foodId);
    if (!food) {
      throw new Error("Food not found");
    }

    await ctx.db.patch(foodId, { category });

    return {
      success: true,
      message: `Category for "${food.name}" set to "${category}"`,
      foodId
    };
  }
});

export const getFoodsByCategory = query({
  args: {
    category: v.string()
  },
  handler: async (ctx, args) => {
    const { category } = args;

    const foods = await ctx.db
      .query("foodMacros")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();

    return {
      success: true,
      count: foods.length,
      foods
    };
  }
});
