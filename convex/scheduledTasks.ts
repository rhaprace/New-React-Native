// convex/scheduledTasks.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// Define scheduled tasks
const scheduledTasks = cronJobs();

// Wrapper for subscription renewal notifications with logging
export const loggedRenewalNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting scheduled task: send-renewal-notifications");
    try {
      const result = await ctx.runAction(
        internal.subscriptionRenewal.sendRenewalNotifications
      );
      console.log("Completed send-renewal-notifications:", result);
      return result;
    } catch (error) {
      console.error("Error in send-renewal-notifications:", error);
      throw error;
    }
  },
});

// Wrapper for subscription renewals with logging
export const loggedRenewalProcessing = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting scheduled task: process-subscription-renewals");
    try {
      const result = await ctx.runAction(
        internal.subscriptionRenewal.processRenewals
      );
      console.log("Completed process-subscription-renewals:", result);
      return result;
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
  },
  internal.scheduledTasks.loggedRenewalNotifications
);

// Process subscription renewals daily at 1:00 AM
scheduledTasks.daily(
  "process-subscription-renewals",
  {
    hourUTC: 17, // 1:00 AM in PHT (UTC+8)
  },
  internal.scheduledTasks.loggedRenewalProcessing
);

export default scheduledTasks;
