/**
 * This file is kept for reference but the actual email functionality
 * has been moved to the Convex backend (convex/email.ts).
 *
 * Email sending is now handled through Convex actions to avoid
 * Node.js dependency issues and to better handle API keys.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Note: These functions are now implemented in convex/email.ts
export const sendEmail = async (options: EmailOptions) => {
  console.warn("Email functionality has been moved to Convex backend");
  return {
    success: false,
    message: "Email functionality has been moved to Convex backend",
  };
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  console.warn("Email functionality has been moved to Convex backend");
  return {
    success: false,
    message: "Email functionality has been moved to Convex backend",
  };
};
