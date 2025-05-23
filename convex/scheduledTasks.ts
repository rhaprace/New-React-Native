// convex/scheduledTasks.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { ActionCtx } from "./_generated/server";

// Define scheduled tasks
const scheduledTasks = cronJobs();

// Define return type for renewal notifications
type RenewalNotificationsResult = {
  totalNotified: number;
  results: Array<{
    userId: any;
    success: boolean;
    message?: string;
    error?: string;
  }>;
};

// Wrapper for subscription renewal notifications with logging
export const loggedRenewalNotifications = internalAction({
  args: {},
  handler: async (ctx: ActionCtx): Promise<RenewalNotificationsResult> => {
    console.log("Starting scheduled task: send-renewal-notifications");
    try {
      const result = await ctx.runAction(
        internal.subscriptionRenewal.sendRenewalNotifications
      );
      console.log("Completed send-renewal-notifications:", result);
      return result as RenewalNotificationsResult;
    } catch (error) {
      console.error("Error in send-renewal-notifications:", error);
      throw error;
    }
  },
});

// Define return type for renewal processing
type RenewalProcessingResult = {
  totalProcessed: number;
  results: Array<{
    userId: any;
    success: boolean;
    paymentIntentId?: string;
    status?: string;
    error?: string;
    retryScheduled?: boolean;
  }>;
};

// Wrapper for subscription renewals with logging
export const loggedRenewalProcessing = internalAction({
  args: {},
  handler: async (ctx: ActionCtx): Promise<RenewalProcessingResult> => {
    console.log("Starting scheduled task: process-subscription-renewals");
    try {
      const result = await ctx.runAction(
        internal.subscriptionRenewal.processRenewals
      );
      console.log("Completed process-subscription-renewals:", result);
      return result as RenewalProcessingResult;
    } catch (error) {
      console.error("Error in process-subscription-renewals:", error);
      throw error;
    }
  },
});

// Run subscription renewal notifications daily at 8:00 AM
scheduledTasks.daily(
  "send-renewal-notifications",
  {
    hourUTC: 0, // 8:00 AM in PHT (UTC+8)
    minuteUTC: 0, // Required parameter
  },
  internal.scheduledTasks.loggedRenewalNotifications
);

// Process subscription renewals daily at 1:00 AM
scheduledTasks.daily(
  "process-subscription-renewals",
  {
    hourUTC: 17, // 1:00 AM in PHT (UTC+8)
    minuteUTC: 0, // Required parameter
  },
  internal.scheduledTasks.loggedRenewalProcessing
);

export default scheduledTasks;
