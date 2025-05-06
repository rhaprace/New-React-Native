import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type ScheduleResetResult = {
  success: boolean;
  scheduledFor: string;
  millisecondsUntilMidnight: number;
};

export const initChatResetSchedule = action({
  args: {},
  handler: async (ctx): Promise<ScheduleResetResult> => {
    const internalApi = internal as any;
    return await ctx.runAction(internalApi["internal/chatReset"].scheduleNextReset);
  },
});
