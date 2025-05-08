import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + 7);

    const userId = await ctx.db.insert("users", {
      ...args,
      subscription: "inactive", // Start with inactive status
      trialUsed: false, // Trial not used yet
      hasSeenSubscriptionPrompt: false,
    });

    return await ctx.db.get(userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return { ...user, profile };
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.optional(v.string()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    age: v.optional(v.number()),
    gender: v.optional(
      v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))
    ),
    activityLevel: v.optional(
      v.union(
        v.literal("Sedentary"),
        v.literal("Lightly Active"),
        v.literal("Moderately Active"),
        v.literal("Very Active"),
        v.literal("Extremely Active")
      )
    ),
    bmr: v.optional(v.number()),
    dailyCalories: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Authenticated user not found.");
    }
    if (args.fullname) {
      await ctx.db.patch(currentUser._id, { fullname: args.fullname });
    }
    const updatedProfile = {
      ...(args.weight !== undefined && { weight: args.weight }),
      ...(args.height !== undefined && { height: args.height }),
      ...(args.age !== undefined && { age: args.age }),
      ...(args.gender !== undefined && { gender: args.gender }),
      ...(args.activityLevel !== undefined && {
        activityLevel: args.activityLevel,
      }),
      ...(args.bmr !== undefined && { bmr: args.bmr }),
      ...(args.dailyCalories !== undefined && {
        dailyCalories: args.dailyCalories,
      }),
      updatedAt: new Date().toISOString(),
    };
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    let profileDoc;
    if (profile) {
      await ctx.db.patch(profile._id, updatedProfile);
      profileDoc = await ctx.db.get(profile._id);
    } else {
      const profileId = await ctx.db.insert("profile", {
        userId: currentUser._id,
        ...updatedProfile,
      });
      profileDoc = await ctx.db.get(profileId);

      if (!profileDoc) {
        throw new Error("Failed to create profile");
      }
    }

    return { profile: profileDoc };
  },
});

export const saveExpoPushToken = mutation({
  args: {
    clerkId: v.string(),
    expoPushToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { expoPushToken: args.expoPushToken });
    return { success: true };
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("User is not authenticated");
  }

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) {
    throw new ConvexError("User not found. Please complete registration.");
  }

  return currentUser;
}
