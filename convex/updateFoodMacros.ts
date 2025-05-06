import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateFoodMacro = mutation({
  args: {
    foodId: v.id("foodMacros"),
    name: v.optional(v.string()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fat: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { foodId, ...updateFields } = args;
    const existingFood = await ctx.db.get(foodId);
    if (!existingFood) {
      throw new Error("Food item not found");
    }
    const fieldsToUpdate: any = {};
    if (updateFields.name !== undefined) {
      fieldsToUpdate.name = updateFields.name.toLowerCase().trim();
    }
    if (updateFields.calories !== undefined) {
      fieldsToUpdate.calories = updateFields.calories;
    }
    if (updateFields.protein !== undefined) {
      fieldsToUpdate.protein = updateFields.protein;
    }
    if (updateFields.carbs !== undefined) {
      fieldsToUpdate.carbs = updateFields.carbs;
    }
    if (updateFields.fat !== undefined) {
      fieldsToUpdate.fat = updateFields.fat;
    }
    await ctx.db.patch(foodId, fieldsToUpdate);

    return {
      success: true,
      message: "Food item updated successfully",
      foodId
    };
  }
});
export const bulkUpdateFoodMacros = mutation({
  args: {
    updates: v.array(
      v.object({
        foodId: v.id("foodMacros"),
        name: v.optional(v.string()),
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fat: v.optional(v.number()),
      })
    )
  },
  handler: async (ctx, args) => {
    const { updates } = args;
    const results = [];

    for (const update of updates) {
      const { foodId, ...updateFields } = update;
      const existingFood = await ctx.db.get(foodId);
      if (!existingFood) {
        results.push({
          success: false,
          message: `Food item with ID ${foodId} not found`,
          foodId
        });
        continue;
      }
      const fieldsToUpdate: any = {};
      if (updateFields.name !== undefined) {
        fieldsToUpdate.name = updateFields.name.toLowerCase().trim();
      }
      if (updateFields.calories !== undefined) {
        fieldsToUpdate.calories = updateFields.calories;
      }
      if (updateFields.protein !== undefined) {
        fieldsToUpdate.protein = updateFields.protein;
      }
      if (updateFields.carbs !== undefined) {
        fieldsToUpdate.carbs = updateFields.carbs;
      }
      if (updateFields.fat !== undefined) {
        fieldsToUpdate.fat = updateFields.fat;
      }
      await ctx.db.patch(foodId, fieldsToUpdate);

      results.push({
        success: true,
        message: "Food item updated successfully",
        foodId
      });
    }

    return {
      success: true,
      results
    };
  }
});
export const deleteFoodMacro = mutation({
  args: {
    foodId: v.id("foodMacros"),
  },
  handler: async (ctx, args) => {
    const { foodId } = args;
    const existingFood = await ctx.db.get(foodId);
    if (!existingFood) {
      throw new Error("Food item not found");
    }
    await ctx.db.delete(foodId);

    return {
      success: true,
      message: "Food item deleted successfully",
      foodId
    };
  }
});
