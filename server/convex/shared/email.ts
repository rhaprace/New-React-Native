export interface EmailResult {
  success: boolean;
}

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendVerificationEmailArgs {
  email: string;
  otp: string;
}
