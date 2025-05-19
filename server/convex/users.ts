import { mutation, query, action } from "./_generated/server";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { internal, api } from "./_generated/api";

// Helper to generate OTP
function generateOTP(): string {
  // Generate a secure 6-digit OTP
  const otp = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  console.log("Generated new OTP:", { otp });
  return otp;
}

// Define user type
interface User {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  username: string;
  fullname: string;
  isEmailVerified: boolean;
  emailOTP?: string;
  otpExpiryTime?: number;
  image?: string;
  subscription: "inactive" | "active" | "free_trial";
  hasSeenSubscriptionPrompt: boolean;
  expoPushToken?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionEndDate?: string;
  paymentMethodEntered?: boolean;
  trialUsed?: boolean;
  promoMonthsLeft?: number;
  paymentDetails?: {
    paymentIntentId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    status: string;
    lastPaymentDate: string;
    nextBillingDate: string;
  };
}

// Helper function to get authenticated user
export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<User> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("User is not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new ConvexError("User not found. Please complete registration.");
  }

  // Cast to User type and ensure required fields have default values
  return {
    ...user,
    isEmailVerified: user.isEmailVerified ?? false,
    subscription: user.subscription ?? "inactive",
    hasSeenSubscriptionPrompt: user.hasSeenSubscriptionPrompt ?? false,
  } as User;
}

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      ...args,
      subscription: "inactive",
      hasSeenSubscriptionPrompt: false,
      isEmailVerified: false,
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

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      const profile = await ctx.db
        .query("profile")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      return { ...user, profile };
    } catch (error) {
      console.error("Error in getUser query:", error);
      return null;
    }
  },
});

export const getUsersByPaymongoCustomerId = query({
  args: {
    paymongoCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_subscription", (q) => q.eq("subscription", "active"))
      .collect();

    // Filter users by PayMongo customer ID
    return users.filter(
      (user) =>
        user.paymentDetails?.paymongoCustomerId === args.paymongoCustomerId
    );
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

interface SendEmailOTPResult {
  success: boolean;
  message: string;
  details?: any;
}

// Convert sendEmailOTP to an action since it needs to call another action
export const sendEmailOTP = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<SendEmailOTPResult> => {
    try {
      console.log("Starting sendEmailOTP for clerkId:", args.clerkId);

      // Get user information
      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: args.clerkId,
      });

      if (!user) {
        console.log("User not found for clerkId:", args.clerkId);
        return {
          success: false,
          message: "User not found. Please try logging in again.",
          details: { error: "user_not_found", clerkId: args.clerkId },
        };
      }

      console.log("Found user:", {
        email: user.email,
        name: user.fullname,
        userId: user._id,
        isEmailVerified: user.isEmailVerified,
      });

      // Check if email is already verified
      if (user.isEmailVerified) {
        console.log("Email already verified for user:", user.email);
        return {
          success: true,
          message: "Your email is already verified.",
          details: { status: "already_verified" },
        };
      }

      let otp;
      let expiryTime;

      // Check if user already has a valid OTP
      if (
        user.emailOTP &&
        user.otpExpiryTime &&
        user.otpExpiryTime > Date.now()
      ) {
        console.log("User already has a valid OTP, reusing it:", {
          userId: user._id,
          email: user.email,
          otpExists: !!user.emailOTP,
          expiryTimeValid: user.otpExpiryTime > Date.now(),
          timeRemaining:
            Math.floor((user.otpExpiryTime - Date.now()) / 1000) + " seconds",
        });

        // Use existing OTP if it's still valid (not expired)
        otp = user.emailOTP;
        expiryTime = user.otpExpiryTime;
      } else {
        // Generate a new OTP if none exists or the existing one is expired
        otp = generateOTP();
        console.log("Generated new OTP for user:", {
          userId: user._id,
          email: user.email,
          otp,
        });

        expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Update user with new OTP
        try {
          await ctx.runMutation(api.users.updateUserOTP, {
            clerkId: args.clerkId,
            otp,
            expiryTime,
          });
          console.log("Updated user with OTP and expiry time");
        } catch (updateError: any) {
          console.error("Error updating user OTP:", updateError);
          return {
            success: false,
            message: "Failed to generate verification code. Please try again.",
            details: {
              error: "update_otp_failed",
              message: updateError.message,
            },
          };
        }
      }

      try {
        // Send OTP via email
        console.log("Sending OTP email to user:", {
          email: user.email,
          name: user.fullname,
        });

        const emailResult = await ctx.runAction(
          internal.internal.email.sendOTPEmail,
          {
            to: {
              email: user.email,
              name: user.fullname,
            },
            otp,
          }
        );

        console.log("Email send result:", emailResult);

        if (!emailResult.success) {
          console.error("Failed to send OTP email:", emailResult.error);

          // If email sending fails, clear the OTP to prevent issues
          await ctx.runMutation(api.users.updateUserOTP, {
            clerkId: args.clerkId,
            otp: undefined,
            expiryTime: undefined,
          });

          return {
            success: false,
            message:
              "Failed to send verification code. Please check your email address and try again.",
            details: {
              error: "email_send_failed",
              emailError: emailResult.error,
              emailDetails: emailResult.details,
            },
          };
        }

        return {
          success: true,
          message:
            "Verification code sent successfully. Please check your email inbox (including spam folder).",
          details: { messageId: emailResult.messageId },
        };
      } catch (emailError: any) {
        console.error("Error sending OTP email:", emailError);

        // If email sending fails, clear the OTP to prevent issues
        await ctx.runMutation(api.users.updateUserOTP, {
          clerkId: args.clerkId,
          otp: undefined,
          expiryTime: undefined,
        });

        return {
          success: false,
          message: "Failed to send verification code. Please try again later.",
          details: {
            error: "email_action_failed",
            message: emailError.message,
          },
        };
      }
    } catch (error: any) {
      console.error("Error in sendEmailOTP:", error);
      return {
        success: false,
        message: "Failed to process your request. Please try again.",
        details: { error: "general_error", message: error.message },
      };
    }
  },
});

export const updateUserOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.optional(v.string()),
    expiryTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      emailOTP: args.otp,
      otpExpiryTime: args.expiryTime,
    });

    return { success: true };
  },
});

export const verifyEmailOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Verifying OTP:", { clerkId: args.clerkId, otp: args.otp });
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.isEmailVerified) {
      return { success: true, verified: true };
    }

    if (!user.emailOTP || !user.otpExpiryTime) {
      console.log("No OTP found for user:", { userId: user._id });
      throw new ConvexError("No OTP found. Please request a new one.");
    }

    if (Date.now() > user.otpExpiryTime) {
      console.log("OTP expired:", {
        expiryTime: user.otpExpiryTime,
        currentTime: Date.now(),
        diff: Date.now() - user.otpExpiryTime,
      });
      throw new ConvexError("OTP has expired. Please request a new one.");
    }

    console.log("Comparing OTPs:", {
      providedOTP: args.otp,
      storedOTP: user.emailOTP,
      match: args.otp === user.emailOTP,
    });
    if (args.otp !== user.emailOTP) {
      throw new ConvexError("Invalid OTP. Please try again.");
    }

    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailOTP: undefined,
      otpExpiryTime: undefined,
    });

    return { success: true, verified: true };
  },
});

export const verifyOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!user.emailOTP || !user.otpExpiryTime) {
      return {
        success: false,
        message: "No OTP found. Please request a new one.",
      };
    }

    if (Date.now() > user.otpExpiryTime) {
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      };
    }

    if (args.otp !== user.emailOTP) {
      return {
        success: false,
        message: "Invalid OTP. Please try again.",
      };
    }

    // OTP is valid, clear it and mark email as verified
    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailOTP: undefined,
      otpExpiryTime: undefined,
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  },
});
