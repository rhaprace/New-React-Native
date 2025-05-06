import { internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { FunctionReference } from "convex/server";
type ResetMessagesResult = {
  success: boolean;
  messagesDeleted: number;
  timestamp: string;
};

type ScheduleResetResult = {
  success: boolean;
  scheduledFor: string;
  millisecondsUntilMidnight: number;
};
export const resetAllChatMessages = internalMutation({
  args: {},
  handler: async (ctx): Promise<ResetMessagesResult> => {
    const chatMessages = await ctx.db.query("chatMessages").collect();
    for (const message of chatMessages) {
      await ctx.db.delete(message._id);
    }

    return {
      success: true,
      messagesDeleted: chatMessages.length,
      timestamp: new Date().toISOString()
    };
  },
});
export const scheduleNextReset = internalAction({
  args: {},
  handler: async (ctx): Promise<ScheduleResetResult> => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); 

    const millisecondsUntilMidnight = midnight.getTime() - now.getTime();
    const internalApi = internal as any;

    await ctx.scheduler.runAfter(
      millisecondsUntilMidnight,
      internalApi["internal/chatReset"].resetAllChatMessages
    );

    await ctx.scheduler.runAfter(
      millisecondsUntilMidnight + 1000,
      internalApi["internal/chatReset"].scheduleNextReset
    );

    return {
      success: true,
      scheduledFor: midnight.toISOString(),
      millisecondsUntilMidnight
    };
  },
});
