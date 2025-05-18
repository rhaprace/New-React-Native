import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { ActionCtx } from "../_generated/server";

const BREVO_API_URL = "https://api.sendinblue.com/v3/smtp/email";
const FROM_EMAIL = "rhaprace@gmail.com";
const SUPPORT_EMAIL = "rhaprace@gmail.com";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}
export const sendOTPEmail = internalAction({
  args: {
    to: v.object({
      email: v.string(),
      name: v.string(),
    }),
    otp: v.string(),
  },
  handler: async (ctx: ActionCtx, args): Promise<EmailResult> => {
    try {
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      console.log("Brevo API key status:", {
        exists: !!BREVO_API_KEY,
        length: BREVO_API_KEY ? BREVO_API_KEY.length : 0,
        prefix: BREVO_API_KEY ? BREVO_API_KEY.substring(0, 8) + "..." : "none",
      });

      if (!BREVO_API_KEY) {
        console.error("Brevo API key is not configured in Convex environment");
        throw new Error(
          "Email service is not properly configured. API key missing."
        );
      }

      console.log("Preparing to send OTP email to:", args.to.email);
      const emailData = {
        sender: {
          name: "Atle Verification",
          email: FROM_EMAIL,
        },
        to: [
          {
            email: args.to.email,
            name: args.to.name,
          },
        ],
        subject: "Your Atle Verification Code",
        replyTo: {
          email: SUPPORT_EMAIL,
          name: "Atle Support",
        },
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center;">Verification Code</h1>
            <p>Hello ${args.to.name},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
              ${args.otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Thank you,<br>The Atle Team</p>
          </div>
        `,
      };

      console.log("Sending request to Brevo API...");

      try {
        const response = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "API-Key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        console.log("Email API response status:", response.status);
        const responseData = await response.json();

        if (!response.ok) {
          console.error("Email API error:", responseData);
          return {
            success: false,
            error: responseData.message || "Failed to send verification email",
            details: responseData,
          };
        }

        console.log("Email sent successfully:", {
          messageId: responseData.messageId,
        });

        return {
          success: true,
          messageId: responseData.messageId || `msg-${Date.now()}`,
        };
      } catch (fetchError: any) {
        console.error("Fetch error in email sending:", fetchError);
        return {
          success: false,
          error: `Network error: ${fetchError.message}`,
          details: { type: "network_error", message: fetchError.message },
        };
      }
    } catch (error: any) {
      console.error("Error in sendOTPEmail:", error);
      return {
        success: false,
        error: error.message || "Failed to send verification email",
        details: { type: "general_error", error },
      };
    }
  },
});
export const sendEmail = internalAction({
  args: {
    to: v.object({
      email: v.string(),
      name: v.string(),
    }),
    subject: v.string(),
    templateId: v.optional(v.number()),
    params: v.optional(v.any()),
    htmlContent: v.optional(v.string()),
  },
  handler: async (ctx: ActionCtx, args): Promise<EmailResult> => {
    try {
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      console.log("Brevo API key status for generic email:", {
        exists: !!BREVO_API_KEY,
        length: BREVO_API_KEY ? BREVO_API_KEY.length : 0,
        prefix: BREVO_API_KEY ? BREVO_API_KEY.substring(0, 8) + "..." : "none",
      });

      if (!BREVO_API_KEY) {
        console.error("Brevo API key is not configured in Convex environment");
        throw new Error(
          "Email service is not properly configured. API key missing."
        );
      }
      console.log("Preparing to send email to:", args.to.email);
      const emailData: any = {
        sender: {
          name: "Atle Notifications",
          email: FROM_EMAIL,
        },
        to: [
          {
            email: args.to.email,
            name: args.to.name,
          },
        ],
        subject: args.subject,
        replyTo: {
          email: SUPPORT_EMAIL,
          name: "Atle Support",
        },
      };
      if (args.templateId) {
        emailData.templateId = args.templateId;
        emailData.params = args.params || {};
      } else if (args.htmlContent) {
        emailData.htmlContent = args.htmlContent;
      } else {
        emailData.templateId = 1;
        emailData.params = {
          app_name: "ATLETECH",
          company: "ATLETECH",
        };
      }

      console.log("Sending request to Brevo API for generic email...");

      try {
        const response = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "API-Key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        console.log("Email API response status:", response.status);
        const responseData = await response.json();

        if (!response.ok) {
          console.error("Email API error:", responseData);
          return {
            success: false,
            error: responseData.message || "Failed to send email",
            details: responseData,
          };
        }

        console.log("Email sent successfully:", {
          messageId: responseData.messageId,
        });

        return {
          success: true,
          messageId: responseData.messageId || `message-${Date.now()}`,
        };
      } catch (fetchError: any) {
        console.error("Fetch error in email sending:", fetchError);
        return {
          success: false,
          error: `Network error: ${fetchError.message}`,
          details: { type: "network_error", message: fetchError.message },
        };
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
        details: { type: "general_error", error },
      };
    }
  },
});
