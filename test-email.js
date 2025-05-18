// Simple script to test Brevo email sending
const { default: fetch } = require("node-fetch");

const BREVO_API_URL = "https://api.sendinblue.com/v3/smtp/email";
const BREVO_API_KEY =
  "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";
const FROM_EMAIL = "rhaprace@gmail.com";
const TO_EMAIL = "rhaprace@gmail.com"; // Replace with your email

async function testEmailSending() {
  try {
    console.log("Testing email sending with Brevo API...");

    const emailData = {
      sender: {
        name: "Atle Test",
        email: FROM_EMAIL,
      },
      to: [
        {
          email: TO_EMAIL,
          name: "Test User",
        },
      ],
      subject: "Test Email from Atle App",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #4a5568; text-align: center;">Test Email</h1>
          <p>This is a test email to verify that the Brevo API is working correctly.</p>
          <p>If you received this email, your email service is configured properly.</p>
        </div>
      `,
    };

    console.log("Sending request to Brevo API...");

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "API-Key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("Response status:", response.status);

    const result = await response.json();
    console.log("Response data:", result);

    if (response.ok) {
      console.log("Email sent successfully!");
    } else {
      console.error("Failed to send email:", result);
    }
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

testEmailSending();
