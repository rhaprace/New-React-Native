import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const subscriptionStatus = v.union(
  v.literal("inactive"),
  v.literal("pending"),
  v.literal("active"),
  v.literal("expired"),
  v.literal("free_trial")
);

const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed")
);

const paymentMethod = v.union(
  v.literal("gcash"),
  v.literal("paymaya"),
  v.literal("card")
);

export default defineSchema({
  users: defineTable({
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    subscription: subscriptionStatus,
    subscriptionEndDate: v.optional(v.string()),
    trialStartDate: v.optional(v.string()),
    trialEndDate: v.optional(v.string()),
    trialUsed: v.optional(v.boolean()),
    paymentDetails: v.optional(
      v.object({
        paymentIntentId: v.optional(v.string()),
        paymentLinkId: v.optional(v.string()),
        paymentMethod: v.optional(paymentMethod),
        amount: v.number(),
        currency: v.string(),
        status: paymentStatus,
        lastPaymentDate: v.string(),
        nextBillingDate: v.string(),
        subscriptionEndDate: v.string(),
      })
    ),
    hasSeenSubscriptionPrompt: v.optional(v.boolean()),
    pendingPaymentSource: v.optional(v.string()),
    pendingPaymentTimestamp: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_subscription", ["subscription"])
    .index("by_trialEndDate", ["trialEndDate"])
    .index("by_subscriptionEndDate", ["subscriptionEndDate"]),

  profile: defineTable({
    userId: v.id("users"),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    age: v.optional(v.number()),
    bmr: v.optional(v.number()),
    dailyCalories: v.optional(v.number()),
    updatedAt: v.string(),
    activityLevel: v.optional(
      v.union(
        v.literal("Sedentary"),
        v.literal("Lightly Active"),
        v.literal("Moderately Active"),
        v.literal("Very Active"),
        v.literal("Extremely Active")
      )
    ),
    gender: v.optional(
      v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))
    ),
  }).index("by_userId", ["userId"]),

  exercise: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    caloriesBurned: v.number(),
    day: v.string(),
    date: v.string(),
    isCompleted: v.boolean(),
  }).index("by_user_day_date", ["userId", "day", "date"]),

  recentWorkouts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    caloriesBurned: v.number(),
    day: v.string(),
    date: v.string(),
    lastUsed: v.string(), // ISO date string for sorting by recency
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"])
    .index("by_last_used", ["userId", "lastUsed"]),

  meal: defineTable({
    userId: v.id("users"),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    date: v.string(),
    day: v.string(),
    mealType: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  addedMeals: defineTable({
    userId: v.id("users"),
    mealName: v.string(),
    mealType: v.string(),
    day: v.string(),
    date: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_detailed", ["userId", "mealType", "day", "date"]),

  foodMacros: defineTable({
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    category: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"]),

  calorieGoalTracking: defineTable({
    userId: v.id("users"),
    date: v.string(),
    goalReached: v.boolean(),
    goalExceeded: v.boolean(),
    totalCalories: v.number(),
    dailyCalorieGoal: v.number(),
    lastUpdated: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    content: v.string(),
    isUserMessage: v.boolean(),
    timestamp: v.string(),
  }).index("by_user_timestamp", ["userId", "timestamp"]),
});
