// convex/subscription.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

// Define subscription status with only the allowed values from User interface
const subscriptionStatus = v.union(
  v.literal("inactive"),
  v.literal("active"),
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

// Payment details interface that matches both the database schema and our validation
interface PaymentDetails {
  paymentIntentId?: string;
  paymentLinkId?: string;
  paymentMethod?: "gcash" | "paymaya" | "card";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  lastPaymentDate: string;
  nextBillingDate: string;
  subscriptionEndDate: string;
  // PayMongo integration fields for recurring payments
  paymongoCustomerId?: string;
  paymongoPaymentMethodId?: string;
}

// Add new fields to track payment method and promo period
const userSchema = v.object({
  // ... existing fields ...
  paymentMethodEntered: v.optional(v.boolean()),
  promoStartDate: v.optional(v.string()),
  promoMonthsLeft: v.optional(v.number()),
});

export const updateSubscription = mutation({
  args: {
    subscription: subscriptionStatus,
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
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const updates: any = {
      subscription: args.subscription,
      hasSeenSubscriptionPrompt: true,
    };

    if (args.paymentDetails) {
      updates.paymentDetails = args.paymentDetails as PaymentDetails;
      updates.subscriptionEndDate = args.paymentDetails.subscriptionEndDate;
    } else {
      updates.paymentDetails = undefined;
    }

    // Clear trial dates when changing from free_trial to active subscription
    if (user.subscription === "free_trial" && args.subscription === "active") {
      updates.trialStartDate = "";
      updates.trialEndDate = "";
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

    // Check trial expiration and auto-convert to promo if payment method is entered
    if (user.subscription === "free_trial" && user.trialEndDate) {
      const trialEnd = new Date(user.trialEndDate);
      if (now > trialEnd) {
        if (user.paymentMethodEntered) {
          // Start 3-month promo period
          const promoStartDate = new Date();
          const nextBillingDate = new Date(promoStartDate);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          const newPaymentDetails: PaymentDetails = {
            paymentMethod: user.paymentDetails?.paymentMethod as
              | "gcash"
              | "paymaya"
              | "card"
              | undefined,
            amount: 7500, // ₱75.00 for promo period
            currency: "PHP",
            status: "completed",
            lastPaymentDate: promoStartDate.toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            subscriptionEndDate: nextBillingDate.toISOString(),
          };

          await ctx.db.patch(user._id, {
            subscription: "active",
            promoStartDate: promoStartDate.toISOString(),
            promoMonthsLeft: 3,
            paymentDetails: newPaymentDetails,
            trialStartDate: "", // Clear trial dates when converting to active subscription
            trialEndDate: "",
          });
          return { status: "active", isPromo: true, promoMonthsLeft: 3 };
        } else {
          // No payment method, expire trial
          await ctx.db.patch(user._id, {
            subscription: "inactive",
            trialEndDate: "",
          });
          return { status: "inactive", endDate: trialEnd.toISOString() };
        }
      }
      return { status: "free_trial", endDate: user.trialEndDate };
    }

    // Check subscription expiration and handle promo period
    if (user.subscriptionEndDate) {
      const subEnd = new Date(user.subscriptionEndDate);
      if (now > subEnd) {
        if (user.promoMonthsLeft && user.promoMonthsLeft > 0) {
          // Continue promo period with next month at ₱75
          const newPromoMonthsLeft = user.promoMonthsLeft - 1;
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          if (newPromoMonthsLeft > 0) {
            // Still in promo period
            const newPaymentDetails: PaymentDetails = {
              ...user.paymentDetails,
              paymentMethod: user.paymentDetails?.paymentMethod as
                | "gcash"
                | "paymaya"
                | "card"
                | undefined,
              amount: 7500, // Still ₱75.00 for remaining promo months
              currency: "PHP",
              status: "completed",
              lastPaymentDate: now.toISOString(),
              nextBillingDate: nextBillingDate.toISOString(),
              subscriptionEndDate: nextBillingDate.toISOString(),
            };

            await ctx.db.patch(user._id, {
              promoMonthsLeft: newPromoMonthsLeft,
              paymentDetails: newPaymentDetails,
            });
            return {
              status: "active",
              isPromo: true,
              promoMonthsLeft: newPromoMonthsLeft,
              nextBillingDate: nextBillingDate.toISOString(),
            };
          } else {
            // Promo period ended, switch to regular price
            const newPaymentDetails: PaymentDetails = {
              ...user.paymentDetails,
              paymentMethod: user.paymentDetails?.paymentMethod as
                | "gcash"
                | "paymaya"
                | "card"
                | undefined,
              amount: 20000, // ₱200.00 regular price
              currency: "PHP",
              status: "completed",
              lastPaymentDate: now.toISOString(),
              nextBillingDate: nextBillingDate.toISOString(),
              subscriptionEndDate: nextBillingDate.toISOString(),
            };

            await ctx.db.patch(user._id, {
              promoMonthsLeft: 0,
              promoStartDate: "",
              paymentDetails: newPaymentDetails,
            });
            return {
              status: "active",
              isPromo: false,
              nextBillingDate: nextBillingDate.toISOString(),
            };
          }
        } else {
          // Regular subscription renewal at ₱200
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          const newPaymentDetails: PaymentDetails = {
            ...user.paymentDetails,
            paymentMethod: user.paymentDetails?.paymentMethod as
              | "gcash"
              | "paymaya"
              | "card"
              | undefined,
            amount: 20000, // ₱200.00 regular price
            currency: "PHP",
            status: "completed",
            lastPaymentDate: now.toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            subscriptionEndDate: nextBillingDate.toISOString(),
          };

          await ctx.db.patch(user._id, {
            paymentDetails: newPaymentDetails,
          });
          return {
            status: "active",
            nextBillingDate: nextBillingDate.toISOString(),
          };
        }
      }
      return {
        status: user.subscription,
        isPromo: user.promoMonthsLeft && user.promoMonthsLeft > 0,
        promoMonthsLeft: user.promoMonthsLeft,
        endDate: user.subscriptionEndDate,
      };
    }

    return { status: user.subscription };
  },
});

export const startFreeTrial = mutation({
  args: {
    paymentMethod: v.optional(paymentMethod),
  },
  handler: async (ctx, args) => {
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
      paymentMethodEntered: !!args.paymentMethod,
      promoStartDate: "",
      promoMonthsLeft: undefined,
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

    const newPaymentDetails: PaymentDetails = {
      paymentIntentId: args.paymentIntentId,
      paymentMethod: args.paymentMethod,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      lastPaymentDate,
      nextBillingDate: nextBillingDate.toISOString(),
      subscriptionEndDate: nextBillingDate.toISOString(),
    };

    // Create updates object with proper typing
    const updates: any = {
      subscription: "active",
      paymentDetails: newPaymentDetails,
      subscriptionEndDate: nextBillingDate.toISOString(),
    };

    // Clear trial dates when changing from free_trial to active subscription
    if (user.subscription === "free_trial") {
      updates.trialStartDate = "";
      updates.trialEndDate = "";
    }

    await ctx.db.patch(user._id, updates);

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
      paymentDetails: undefined,
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
    try {
      const identity = await ctx.auth.getUserIdentity();

      // If user is not authenticated, return empty values
      if (!identity) {
        return {
          sourceId: null,
          timestamp: null,
        };
      }

      // Get user from database
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

      // If user not found, return empty values
      if (!user) {
        return {
          sourceId: null,
          timestamp: null,
        };
      }

      // Return payment source information
      return {
        sourceId: user.pendingPaymentSource,
        timestamp: user.pendingPaymentTimestamp,
      };
    } catch (error) {
      // Handle any errors gracefully
      console.error("Error in checkPaymentSource:", error);
      return {
        sourceId: null,
        timestamp: null,
      };
    }
  },
});

export const saveGCashNumber = mutation({
  args: {
    phoneNumber: v.string(),
    paymongoCustomerId: v.optional(v.string()),
    paymongoPaymentMethodId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Extend trial by 30 days
    const now = new Date();
    const newTrialEndDate = new Date(now);
    newTrialEndDate.setDate(now.getDate() + 30);

    // Create updates object
    const updates: any = {
      gcashNumber: args.phoneNumber,
      trialEndDate: newTrialEndDate.toISOString(),
    };

    // If PayMongo IDs are provided, update payment details
    if (args.paymongoCustomerId && args.paymongoPaymentMethodId) {
      // Create new payment details object with all required fields
      const paymentDetails: PaymentDetails = {
        amount: 0,
        currency: "PHP",
        status: "pending",
        lastPaymentDate: now.toISOString(),
        nextBillingDate: newTrialEndDate.toISOString(),
        subscriptionEndDate: newTrialEndDate.toISOString(),
        paymentMethod: "gcash",
        paymongoCustomerId: args.paymongoCustomerId,
        paymongoPaymentMethodId: args.paymongoPaymentMethodId,
      };

      // If user already has payment details, preserve existing values
      if (user.paymentDetails) {
        Object.assign(paymentDetails, {
          ...user.paymentDetails,
          paymongoCustomerId: args.paymongoCustomerId,
          paymongoPaymentMethodId: args.paymongoPaymentMethodId,
          paymentMethod: "gcash",
        });
      }

      updates.paymentDetails = paymentDetails;
      updates.paymentMethodEntered = true;
    }

    await ctx.db.patch(user._id, updates);

    return {
      success: true,
      newTrialEndDate: newTrialEndDate.toISOString(),
      paymentMethodLinked: !!(
        args.paymongoCustomerId && args.paymongoPaymentMethodId
      ),
    };
  },
});

// Add new mutation to save payment method during trial
export const updateSubscriptionByPaymongoCustomerId = mutation({
  args: {
    paymongoCustomerId: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by PayMongo customer ID
    const users = await ctx.db
      .query("users")
      .withIndex("by_subscription", (q) => q.eq("subscription", "active"))
      .collect();

    const user = users.find(
      (u) => u.paymentDetails?.paymongoCustomerId === args.paymongoCustomerId
    );

    if (!user) {
      throw new Error(
        `No user found with PayMongo customer ID: ${args.paymongoCustomerId}`
      );
    }

    // Calculate next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    // Update user subscription
    await ctx.db.patch(user._id, {
      subscription: "active",
      paymentDetails: {
        ...user.paymentDetails,
        paymentIntentId: args.paymentIntentId,
        amount: args.amount,
        currency: args.currency,
        status: "completed",
        lastPaymentDate: new Date().toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        subscriptionEndDate: nextBillingDate.toISOString(),
      },
      subscriptionEndDate: nextBillingDate.toISOString(),
    });

    return {
      success: true,
      userId: user._id,
      nextBillingDate: nextBillingDate.toISOString(),
    };
  },
});

export const saveTrialPaymentMethod = mutation({
  args: {
    paymentMethod: paymentMethod,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (user.subscription !== "free_trial") {
      throw new Error("User is not in trial period");
    }

    const newPaymentDetails: PaymentDetails = {
      paymentMethod: args.paymentMethod,
      status: "pending",
      amount: 0,
      currency: "PHP",
      lastPaymentDate: new Date().toISOString(),
      nextBillingDate: user.trialEndDate || new Date().toISOString(),
      subscriptionEndDate: user.trialEndDate || new Date().toISOString(),
    };

    await ctx.db.patch(user._id, {
      paymentMethodEntered: true,
      paymentDetails: newPaymentDetails,
    });

    return { success: true };
  },
});

// Add a mutation to clear payment source when signing out
export const clearPaymentSource = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      // If user is not authenticated, return success (nothing to clear)
      if (!identity) {
        return { success: true };
      }

      // Get user from database
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

      // If user not found, return success (nothing to clear)
      if (!user) {
        return { success: true };
      }

      // Clear payment source information
      await ctx.db.patch(user._id, {
        pendingPaymentSource: undefined,
        pendingPaymentTimestamp: undefined,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in clearPaymentSource:", error);
      throw new Error("Failed to clear payment source");
    }
  },
});
