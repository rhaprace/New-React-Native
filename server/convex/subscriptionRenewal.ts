// convex/subscriptionRenewal.ts
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Interface for user with payment details
interface UserWithPaymentDetails {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  fullname: string;
  subscription: "inactive" | "active" | "free_trial";
  subscriptionEndDate?: string;
  trialEndDate?: string;
  paymentDetails?: {
    paymentMethod?: "gcash" | "paymaya" | "card";
    amount: number;
    currency: string;
    status: string;
    lastPaymentDate: string;
    nextBillingDate: string;
    subscriptionEndDate: string;
    paymongoCustomerId?: string;
    paymongoPaymentMethodId?: string;
  };
  expoPushToken?: string;
  promoMonthsLeft?: number;
  gcashNumber?: string;
}

/**
 * Find users whose subscriptions are about to expire in the next 3 days
 * This is used to send notifications to users before their subscription renews
 */
export const findSubscriptionsToRenewSoon = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find active subscriptions that expire in the next 3 days
    const users = await ctx.db
      .query("users")
      .withIndex("by_subscription", (q) => q.eq("subscription", "active"))
      .collect();

    // Filter users with valid payment details and expiring soon
    return users.filter((user) => {
      if (
        !user.subscriptionEndDate ||
        !user.paymentDetails?.paymongoCustomerId ||
        !user.paymentDetails?.paymongoPaymentMethodId
      ) {
        return false;
      }

      const expiryDate = new Date(user.subscriptionEndDate);
      return expiryDate <= threeDaysFromNow && expiryDate > now;
    }) as UserWithPaymentDetails[];
  },
});

/**
 * Find users whose subscriptions have expired and need to be renewed
 * This is used to process automatic payments for subscription renewals
 */
export const findExpiredSubscriptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();

    // Find active subscriptions that have expired
    const users = await ctx.db
      .query("users")
      .withIndex("by_subscription", (q) => q.eq("subscription", "active"))
      .collect();

    // Filter users with valid payment details and expired subscriptions
    return users.filter((user) => {
      if (
        !user.subscriptionEndDate ||
        !user.paymentDetails?.paymongoCustomerId ||
        !user.paymentDetails?.paymongoPaymentMethodId
      ) {
        return false;
      }

      const expiryDate = new Date(user.subscriptionEndDate);
      return expiryDate <= now;
    }) as UserWithPaymentDetails[];
  },
});

/**
 * Send notification to users whose subscriptions are about to renew
 */
export const sendRenewalNotifications = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    totalNotified: number;
    results: Array<{
      userId: Id<"users">;
      success: boolean;
      message?: string;
      error?: string;
    }>;
  }> => {
    const usersToNotify = await ctx.runQuery(
      internal.subscriptionRenewal.findSubscriptionsToRenewSoon,
      {}
    );

    const results = [];
    for (const user of usersToNotify) {
      try {
        // Calculate days until renewal
        const expiryDate = new Date(user.subscriptionEndDate!);
        const now = new Date();
        const daysUntil = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine amount based on promo status
        const isPromo = user.promoMonthsLeft && user.promoMonthsLeft > 0;
        const amount = isPromo ? 25000 : 49900; // ₱250 or ₱499
        const formattedAmount = isPromo ? "₱250" : "₱499";

        // Send email notification
        if (user.email) {
          await ctx.runAction(internal.internal.email.sendEmail, {
            to: {
              email: user.email,
              name: user.fullname,
            },
            subject: `Your AtleTech subscription will renew in ${daysUntil} days`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #4a5568; text-align: center;">Subscription Renewal Notice</h1>
                <p>Hello ${user.fullname},</p>
                <p>Your AtleTech subscription will automatically renew in <strong>${daysUntil} days</strong>.</p>
                <p>Your GCash account will be charged ${formattedAmount} on ${expiryDate.toLocaleDateString()}.</p>
                <p>If you wish to cancel your subscription, please do so before the renewal date.</p>
                <p>Thank you for using AtleTech!</p>
                <p>The AtleTech Team</p>
              </div>
            `,
          });
        }

        // Send push notification if token exists
        if (user.expoPushToken) {
          // Implement push notification here
          // This would use Expo's push notification service
        }

        results.push({
          userId: user._id,
          success: true,
          message: `Notification sent to ${user.email}`,
        });
      } catch (error: any) {
        results.push({
          userId: user._id,
          success: false,
          error: error.message || "Unknown error",
        });
      }
    }

    return {
      totalNotified: results.length,
      results,
    };
  },
});

/**
 * Process subscription renewals for expired subscriptions
 */
export const processRenewals = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    totalProcessed: number;
    results: Array<{
      userId: Id<"users">;
      success: boolean;
      paymentIntentId?: string;
      status?: string;
      error?: string;
      retryScheduled?: boolean;
    }>;
  }> => {
    const expiredSubscriptions = await ctx.runQuery(
      internal.subscriptionRenewal.findExpiredSubscriptions,
      {}
    );

    const results = [];
    for (const user of expiredSubscriptions) {
      try {
        if (
          !user.paymentDetails?.paymongoCustomerId ||
          !user.paymentDetails?.paymongoPaymentMethodId
        ) {
          continue;
        }

        // Determine amount based on promo status
        const isPromo = user.promoMonthsLeft
          ? user.promoMonthsLeft > 0
          : undefined;
        const amount = isPromo ? 25000 : 49900; // ₱250 or ₱499

        // Process the payment
        const description = isPromo
          ? "AtleTech Subscription - Promo Rate ₱250"
          : "AtleTech Subscription - Regular Rate ₱499";

        const paymentResult = await ctx.runAction(
          api.payment.createPaymentIntent,
          {
            customerId: user.paymentDetails.paymongoCustomerId,
            paymentMethodId: user.paymentDetails.paymongoPaymentMethodId,
            amount,
            description,
          }
        );

        if (paymentResult.success) {
          // Update subscription in database
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          // Update user subscription
          await ctx.runMutation(api.subscription.updateSubscription, {
            subscription: "active",
            paymentDetails: {
              paymentIntentId: paymentResult.paymentIntentId,
              paymentMethod: "gcash",
              amount: amount,
              currency: "PHP",
              status: "completed",
              lastPaymentDate: new Date().toISOString(),
              nextBillingDate: nextBillingDate.toISOString(),
              subscriptionEndDate: nextBillingDate.toISOString(),
            },
          });

          // Send success notification
          if (user.email) {
            await ctx.runAction(internal.internal.email.sendEmail, {
              to: {
                email: user.email,
                name: user.fullname,
              },
              subject: "Your AtleTech subscription has been renewed",
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h1 style="color: #4a5568; text-align: center;">Subscription Renewed</h1>
                  <p>Hello ${user.fullname},</p>
                  <p>Your AtleTech subscription has been successfully renewed.</p>
                  <p>Your GCash account has been charged ${amount / 100} PHP.</p>
                  <p>Your next billing date is ${nextBillingDate.toLocaleDateString()}.</p>
                  <p>Thank you for using AtleTech!</p>
                  <p>The AtleTech Team</p>
                </div>
              `,
            });
          }

          results.push({
            userId: user._id,
            success: true,
            paymentIntentId: paymentResult.paymentIntentId,
            status: paymentResult.status,
          });
        } else if (paymentResult.status === "paymongo_server_error") {
          // This is a temporary server error from PayMongo
          // We'll log it but not mark the subscription as failed
          // The system will retry on the next scheduled run
          console.log(
            `PayMongo server error for user ${user._id}, will retry later`
          );

          results.push({
            userId: user._id,
            success: false,
            paymentIntentId: paymentResult.paymentIntentId,
            status: paymentResult.status,
            error: "PayMongo server error, will retry later",
            retryScheduled: true,
          });
        } else {
          // Payment failed for other reasons
          results.push({
            userId: user._id,
            success: false,
            paymentIntentId: paymentResult.paymentIntentId,
            status: paymentResult.status,
            error: "Payment processing failed",
          });
        }
      } catch (error: any) {
        results.push({
          userId: user._id,
          success: false,
          error: error.message || "Unknown error",
        });
      }
    }

    return {
      totalProcessed: results.length,
      results,
    };
  },
});

/**
 * Process a successful payment from PayMongo webhook
 */
export const processWebhookPaymentSuccess = internalAction({
  args: {
    paymongoCustomerId: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { success: true; userId: Id<"users">; nextBillingDate: string }
    | { success: false; error: string }
  > => {
    try {
      // Find user by PayMongo customer ID
      const users = await ctx.runQuery(api.users.getUsersByPaymongoCustomerId, {
        paymongoCustomerId: args.paymongoCustomerId,
      });

      if (!users || users.length === 0) {
        console.error(
          `No user found with PayMongo customer ID: ${args.paymongoCustomerId}`
        );
        return {
          success: false,
          error: "User not found",
        };
      }

      const user = users[0];

      // Update subscription with new payment details
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await ctx.runMutation(api.subscription.updateSubscription, {
        subscription: "active",
        paymentDetails: {
          paymentIntentId: args.paymentIntentId,
          paymentMethod: "gcash",
          amount: args.amount,
          currency: args.currency,
          status: "completed",
          lastPaymentDate: new Date().toISOString(),
          nextBillingDate: nextBillingDate.toISOString(),
          subscriptionEndDate: nextBillingDate.toISOString(),
        },
      });

      // Send email notification about successful payment
      if (user.email) {
        await ctx.runAction(internal.internal.email.sendEmail, {
          to: {
            email: user.email,
            name: user.fullname,
          },
          subject: "Your AtleTech subscription has been renewed",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #4a5568; text-align: center;">Subscription Renewed</h1>
              <p>Hello ${user.fullname},</p>
              <p>Your AtleTech subscription has been successfully renewed.</p>
              <p>Your GCash account has been charged ${args.amount / 100} PHP.</p>
              <p>Your next billing date is ${nextBillingDate.toLocaleDateString()}.</p>
              <p>Thank you for using AtleTech!</p>
              <p>The AtleTech Team</p>
            </div>
          `,
        });
      }

      console.log(`Subscription renewed for user: ${user._id}`);

      return {
        success: true,
        userId: user._id,
        nextBillingDate: nextBillingDate.toISOString(),
      };
    } catch (error: any) {
      console.error("Error processing webhook payment success:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  },
});

/**
 * Process a failed payment from PayMongo webhook
 */
export const processWebhookPaymentFailure = internalAction({
  args: {
    paymongoCustomerId: v.string(),
    paymentIntentId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    { success: true; userId: Id<"users"> } | { success: false; error: string }
  > => {
    try {
      // Find user by PayMongo customer ID
      const users = await ctx.runQuery(api.users.getUsersByPaymongoCustomerId, {
        paymongoCustomerId: args.paymongoCustomerId,
      });

      if (!users || users.length === 0) {
        console.error(
          `No user found with PayMongo customer ID: ${args.paymongoCustomerId}`
        );
        return {
          success: false,
          error: "User not found",
        };
      }

      const user = users[0];

      // Send email notification about failed payment
      if (user.email) {
        await ctx.runAction(internal.internal.email.sendEmail, {
          to: {
            email: user.email,
            name: user.fullname,
          },
          subject: "Your AtleTech subscription payment failed",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #e53e3e; text-align: center;">Payment Failed</h1>
              <p>Hello ${user.fullname},</p>
              <p>We were unable to process your subscription payment.</p>
              <p>Please update your payment method or contact support for assistance.</p>
              <p>Your subscription will remain active for now, but we will attempt to charge your account again in a few days.</p>
              <p>Thank you for using AtleTech!</p>
              <p>The AtleTech Team</p>
            </div>
          `,
        });
      }

      console.log(`Payment failed notification sent to user: ${user._id}`);

      return {
        success: true,
        userId: user._id,
      };
    } catch (error: any) {
      console.error("Error processing webhook payment failure:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  },
});
