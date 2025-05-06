// convex/subscription.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";


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

export const updateSubscription = mutation({
args: {
  subscription: subscriptionStatus,
  paymentDetails: v.optional(
    v.union(
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
      }),
      v.null()
    )
  )
},
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const updates: Partial<typeof user> = {
      subscription: args.subscription,
      hasSeenSubscriptionPrompt: true,
    };

    if (args.paymentDetails === null) {
  updates.paymentDetails = undefined;
} else if (args.paymentDetails) {
  const subscriptionEndDate = new Date(args.paymentDetails.nextBillingDate);
  updates.paymentDetails = {
    ...args.paymentDetails,
    subscriptionEndDate: subscriptionEndDate.toISOString(),
  };
  updates.subscriptionEndDate = subscriptionEndDate.toISOString();
}

    await ctx.db.patch(user._id, updates);

    return {
      success: true,
      newStatus: args.subscription,
      subscriptionEndDate: updates.subscriptionEndDate,
      nextBillingDate: args.paymentDetails?.nextBillingDate,
    };
  },
});

export const checkSubscriptionStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const now = new Date();

    if (user.subscription === "free_trial" && user.trialEndDate) {
      const trialEnd = new Date(user.trialEndDate);
      if (now > trialEnd) {
        await ctx.db.patch(user._id, {
          subscription: "expired",
          trialEndDate: "",
        });
        return { status: "expired", endDate: trialEnd.toISOString() };
      }
      return { status: "free_trial", endDate: user.trialEndDate };
    }

    // Check subscription expiration
    if (user.subscriptionEndDate) {
      const subEnd = new Date(user.subscriptionEndDate);
      if (now > subEnd) {
        await ctx.db.patch(user._id, {
          subscription: "expired",
          subscriptionEndDate: "",
        });
        return { status: "expired", endDate: subEnd.toISOString() };
      }
      return { status: user.subscription, endDate: user.subscriptionEndDate };
    }

    return { status: user.subscription };
  },
});

export const startFreeTrial = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    // Check if user has already used their trial
    if (user.trialUsed) {
      throw new Error("You've already used your free trial");
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + 30);

    await ctx.db.patch(user._id, {
      subscription: "free_trial",
      trialUsed: true,
      trialStartDate: trialStartDate.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      hasSeenSubscriptionPrompt: true,
    });

    return {
      success: true,
      status: "free_trial",
      endDate: trialEndDate.toISOString(),
    };
  },
});

export const updatePendingSubscription = mutation({
  args: {
    paymentIntentId: v.string(),
    paymentMethod: v.optional(paymentMethod),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const lastPaymentDate = new Date().toISOString();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await ctx.db.patch(user._id, {
      subscription: "pending",
      paymentDetails: {
        paymentIntentId: args.paymentIntentId,
        paymentMethod: args.paymentMethod,
        amount: args.amount,
        currency: args.currency,
        status: "pending",
        lastPaymentDate,
        nextBillingDate: nextBillingDate.toISOString(),
        subscriptionEndDate: nextBillingDate.toISOString(),
      },
      subscriptionEndDate: nextBillingDate.toISOString(),
    });

    return {
      success: true,
      paymentIntentId: args.paymentIntentId,
      nextBillingDate: nextBillingDate.toISOString(),
    };
  },
});

export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      subscription: "expired",
      subscriptionEndDate: "",
      paymentDetails: undefined ,
    });

    return {
      success: true,
      newStatus: "expired",
      message: "Subscription cancelled successfully",
    };
  },
});

export const updateSubscriptionPromptSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      hasSeenSubscriptionPrompt: true,
    });

    return {
      success: true,
    };
  },
});

export const savePaymentSource = mutation({
  args: {
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      pendingPaymentSource: args.sourceId,
      pendingPaymentTimestamp: Date.now(),
    });

    return {
      success: true,
    };
  },
});

export const checkPaymentSource = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return {
      sourceId: user.pendingPaymentSource,
      timestamp: user.pendingPaymentTimestamp,
    };
  },
});