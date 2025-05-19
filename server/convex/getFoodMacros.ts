import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAllFoodMacros = query({
  handler: async (ctx) => {
    return await ctx.db.query("foodMacros").collect();
  }
});


export const getFoodMacroById = query({
  args: {
    foodId: v.id("foodMacros"),
  },
  handler: async (ctx, args) => {
    const { foodId } = args;
    return await ctx.db.get(foodId);
  }
});

export const searchFoodMacrosByName = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const { searchTerm } = args;
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    const allFoodItems = await ctx.db.query("foodMacros").collect();
    return allFoodItems.filter((food: any) => 
      food.name.includes(normalizedSearchTerm)
    );
  }
});
export const getFoodMacrosByCategory = query({
  args: {
    category: v.union(
      v.literal("protein"),
      v.literal("carbs"),
      v.literal("fat")
    ),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { category, threshold = 0 } = args;

    const allFoodItems = await ctx.db.query("foodMacros").collect();
 
    switch (category) {
      case "protein":
        return allFoodItems.filter((food: any) => food.protein >= threshold)
          .sort((a: any, b: any) => b.protein - a.protein);
      case "carbs":
        return allFoodItems.filter((food: any) => food.carbs >= threshold)
          .sort((a: any, b: any) => b.carbs - a.carbs);
      case "fat":
        return allFoodItems.filter((food: any) => food.fat >= threshold)
          .sort((a: any, b: any) => b.fat - a.fat);
      default:
        return [];
    }
  }
});

export const getFoodMacrosByCalories = query({
  args: {
    sortOrder: v.union(
      v.literal("asc"),
      v.literal("desc")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sortOrder, limit } = args;
 
    let allFoodItems = await ctx.db.query("foodMacros").collect();

    if (sortOrder === "asc") {
      allFoodItems.sort((a: any, b: any) => a.calories - b.calories);
    } else {
      allFoodItems.sort((a: any, b: any) => b.calories - a.calories);
    }

    if (limit !== undefined && limit > 0) {
      allFoodItems = allFoodItems.slice(0, limit);
    }
    
    return allFoodItems;
  }
});
