// Client-side payment service that uses Convex actions
import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react";

// Interface for payment source response
export interface PaymentSourceResponse {
  id: string;
  type: string;
  attributes: {
    amount: number;
    billing: any;
    currency: string;
    description: string;
    livemode: boolean;
    redirect: {
      checkout_url: string;
      failed: string;
      success: string;
    };
    status: string;
    type: string;
  };
}

// Interface for payment method response
export interface PaymentMethodResponse {
  id: string;
  type: string;
  attributes: {
    type: string;
    details: any;
    billing: any;
    metadata: any;
    created_at: number;
    updated_at: number;
  };
}

// Interface for payment intent response
export interface PaymentIntentResponse {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    statement_descriptor: string;
    status: string;
    livemode: boolean;
    client_key: string;
    payment_method_allowed: string[];
    payments: any[];
    last_payment_error: any;
    next_action: any;
    payment_method_options: any;
    metadata: any;
    created_at: number;
    updated_at: number;
  };
}

// Interface for create source params
export interface CreateSourceParams {
  name?: string;
  email?: string;
  phone?: string;
  currency?: string;
  redirectSuccess?: string;
  redirectFailed?: string;
}

/**
 * Create a payment source with PayMongo via Convex
 * This is used to initiate a payment with GCash, PayMaya, etc.
 */
export const createPaymentSource = async (
  convex: ConvexReactClient,
  paymentType: string,
  amount: number,
  params?: Partial<CreateSourceParams>
): Promise<PaymentSourceResponse> => {
  try {
    const result = await convex.action(api.payment.createPaymentSource, {
      paymentType,
      amount,
      description: params?.name ? `Payment for ${params.name}` : undefined,
      name: params?.name,
      email: params?.email,
      phone: params?.phone,
      successUrl: params?.redirectSuccess || "https://example.com/success",
      failedUrl: params?.redirectFailed || "https://example.com/failed",
    });

    return result as PaymentSourceResponse;
  } catch (error) {
    console.error("Error creating payment source:", error);
    throw error;
  }
};

/**
 * Check the status of a payment source
 * This is used to verify if a payment has been completed
 */
export const checkPaymentStatus = async (
  convex: ConvexReactClient,
  sourceId: string
): Promise<string> => {
  try {
    const status = await convex.action(api.payment.checkPaymentStatus, {
      sourceId,
    });
    return status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

/**
 * Create a PayMongo customer
 * This is used for recurring payments
 */
export const createCustomer = async (
  convex: ConvexReactClient,
  params: {
    email?: string;
    name?: string;
    phone?: string;
    defaultDevice?: string;
  }
): Promise<string> => {
  try {
    // Format the phone number properly before sending
    let formattedPhone = params.phone || "";
    if (formattedPhone) {
      // Remove all non-digit characters
      formattedPhone = formattedPhone.replace(/\D/g, "");

      // Format to E.164 format for Philippines
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+63" + formattedPhone.substring(1);
      } else if (
        formattedPhone.startsWith("9") &&
        formattedPhone.length === 10
      ) {
        formattedPhone = "+63" + formattedPhone;
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+63" + formattedPhone;
      }
    }

    // Split the name into first and last name if provided
    let firstName = "";
    let lastName = "";
    if (params.name) {
      const nameParts = params.name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    }

    console.log("Trying to create customer with direct API call");

    // Make a direct API call to PayMongo instead of using the Convex action
    const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

    // Get the PayMongo secret key from environment variables
    // For client-side code, we need to use the Config object
    const Config = require("../config/environment").default;
    const PAYMONGO_SECRET_KEY = Config.paymongoSecretKey;

    console.log(
      "Using PayMongo secret key (first 4 chars):",
      PAYMONGO_SECRET_KEY
        ? PAYMONGO_SECRET_KEY.substring(0, 4) + "..."
        : "not found"
    );

    if (!PAYMONGO_SECRET_KEY) {
      throw new Error("PayMongo secret key is not configured");
    }

    // Create a simplified request with only the required fields
    const customerData = {
      data: {
        attributes: {
          email: params.email || `user_${Date.now()}@atletech-app.com`,
          phone: formattedPhone || undefined,
          first_name: firstName || "User",
          last_name: lastName || "Account",
          default_device: params.defaultDevice || "phone",
        },
      },
    };

    // Log the request payload for debugging
    console.log("Customer creation payload:", JSON.stringify(customerData));

    // Make the API request
    const response = await fetch(`${PAYMONGO_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
      },
      body: JSON.stringify(customerData),
    });

    // Handle the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayMongo API error:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          const error = errorData.errors[0];
          throw new Error(
            `PayMongo API error: ${error.code} - ${error.detail}`
          );
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      throw new Error(
        `Failed to create customer: ${response.status} ${response.statusText}`
      );
    }

    // Parse successful response
    const data = await response.json();
    console.log("Successfully created customer:", data.data.id);
    return data.data.id;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

/**
 * Link a GCash account to a customer
 * This is used for recurring payments
 */
export const linkGCashAccount = async (
  convex: ConvexReactClient,
  params: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }
): Promise<{
  success: boolean;
  customerId: string;
  paymentMethodId: string;
  method?: string;
  warning?: string;
}> => {
  try {
    console.log("Linking GCash account with params:", JSON.stringify(params));

    // Create the customer directly with first_name and last_name
    const customerId = await createCustomer(convex, {
      name: `${params.firstName} ${params.lastName}`,
      phone: params.phone, // Phone formatting is handled in createCustomer
      email: params.email,
      defaultDevice: "phone", // Always use "phone" for GCash
    });

    // Create payment method
    const paymentMethodResponse = await convex.action(
      api.payment.createPaymentMethod,
      {
        customerId,
        type: "gcash",
        details: {
          phone: formattedPhone,
        },
        billingInfo: {
          name: `${params.firstName} ${params.lastName}`,
          email: params.email || `user_${Date.now()}@example.com`,
          phone: formattedPhone,
          address: {
            line1: "Default Address",
            city: "Manila",
            state: "Metro Manila",
            postal_code: "1000",
            country: "PH",
          },
        },
      }
    );

    // Attach payment method to customer with retry logic
    const paymentMethodId = paymentMethodResponse.id;

    // Define retry parameters
    const MAX_RETRIES = 5;
    const INITIAL_DELAY = 1000; // 1 second
    let retryCount = 0;
    let lastError = null;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(
          `Attempt ${retryCount + 1} to attach payment method ${paymentMethodId} to customer ${customerId}`
        );

        // Try to attach the payment method
        const attachResult = await convex.action(
          api.payment.attachPaymentMethod,
          {
            customerId,
            paymentMethodId,
          }
        );

        console.log("Successfully attached payment method:", attachResult);

        // Return the full result including any method or warning fields
        return {
          success: attachResult.success,
          customerId,
          paymentMethodId,
          method: attachResult.method,
          warning: attachResult.warning,
        };
      } catch (error) {
        lastError = error;
        console.error(
          `Error in attempt ${retryCount + 1} to attach payment method:`,
          error
        );

        // Check if it's a 500 error from PayMongo
        const errorMessage = String(error);
        const is500Error =
          errorMessage.includes("500") &&
          errorMessage.includes("Something went wrong on our end");

        if (is500Error) {
          // For 500 errors, we'll retry
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            // Calculate delay with exponential backoff (1s, 2s, 4s, 8s, 16s)
            const delay = INITIAL_DELAY * Math.pow(2, retryCount - 1);
            console.log(`PayMongo server error. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }

    // If we've exhausted all retries but it's a 500 error, we'll proceed anyway
    // This is a fallback in case the server-side error handling didn't work
    const errorStr = String(lastError);
    if (
      errorStr.includes("500") &&
      errorStr.includes("Something went wrong on our end")
    ) {
      console.log(
        "All retries failed with 500 error, but proceeding with account linking"
      );
      return {
        success: true,
        customerId,
        paymentMethodId,
        method: "client_error_recovery",
        warning:
          "Payment method attachment failed with 500 error after multiple retries, but proceeding with account linking",
      };
    }

    // If we've exhausted all retries
    console.error(
      `Failed to attach payment method after ${MAX_RETRIES} attempts`
    );
    throw (
      lastError ||
      new Error(`Failed to attach payment method after ${MAX_RETRIES} attempts`)
    );
  } catch (error) {
    console.error("Error linking GCash account:", error);
    throw error;
  }
};

/**
 * Create a payment intent for subscription
 * This is used for recurring payments
 */
export const createSubscriptionPaymentIntent = async (
  convex: ConvexReactClient,
  customerId: string,
  paymentMethodId: string,
  amount: number,
  description: string
): Promise<{
  success: boolean;
  paymentIntentId: string;
  status: string;
  warning?: string;
}> => {
  try {
    // Add a timestamp to help with debugging
    const timestamp = new Date().toISOString();
    console.log(
      `Creating payment intent at ${timestamp} for customer ${customerId}`
    );

    const result = await convex.action(api.payment.createPaymentIntent, {
      customerId,
      paymentMethodId,
      amount,
      description,
    });

    return result;
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // Check if it's a 500 error from PayMongo
    const errorMessage = String(error);
    if (
      errorMessage.includes("500") &&
      errorMessage.includes("Something went wrong on our end")
    ) {
      // Log detailed information about the error
      console.log(
        "Received 500 error from PayMongo API in createSubscriptionPaymentIntent"
      );
      console.log(`Error details: ${errorMessage}`);

      // Rethrow the error to be handled by the caller's retry logic
      throw error;
    }

    throw error;
  }
};

/**
 * Check the status of a payment intent
 * This is used to verify if a subscription payment has been completed
 */
export const checkPaymentIntentStatus = async (
  convex: ConvexReactClient,
  paymentIntentId: string
): Promise<string> => {
  try {
    const status = await convex.action(api.payment.checkPaymentIntentStatus, {
      paymentIntentId,
    });
    return status;
  } catch (error) {
    console.error("Error checking payment intent status:", error);
    throw error;
  }
};

/**
 * Process a subscription renewal payment
 * This is used to charge a customer's GCash account for subscription renewal
 */
export const processSubscriptionRenewal = async (
  convex: ConvexReactClient,
  customerId: string,
  paymentMethodId: string,
  amount: number,
  isPromo: boolean = false
): Promise<{
  success: boolean;
  paymentIntentId: string;
  status: string;
  warning?: string;
}> => {
  try {
    const description = isPromo
      ? "AtleTech Subscription - Promo Rate ₱250"
      : "AtleTech Subscription - Regular Rate ₱499";

    console.log(
      `Processing subscription renewal for customer ${customerId} with payment method ${paymentMethodId}`
    );
    console.log(
      `Amount: ${amount}, Promo: ${isPromo}, Description: ${description}`
    );

    // Define retry parameters for 500 errors
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 2000; // 2 seconds
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        const result = await createSubscriptionPaymentIntent(
          convex,
          customerId,
          paymentMethodId,
          amount,
          description
        );

        return result;
      } catch (error) {
        lastError = error;

        // Check if it's a 500 error from PayMongo
        const errorMessage = String(error);
        const is500Error =
          errorMessage.includes("500") &&
          errorMessage.includes("Something went wrong on our end");

        if (is500Error && retryCount < MAX_RETRIES) {
          // For 500 errors, we'll retry
          retryCount++;
          // Calculate delay with exponential backoff (2s, 4s, 8s)
          const delay = INITIAL_DELAY * Math.pow(2, retryCount - 1);
          console.log(
            `PayMongo server error. Retrying subscription payment in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // For other errors or if we've exhausted retries, throw
          throw error;
        }
      }
    }

    // This should not be reached due to the throw in the catch block
    throw lastError || new Error("Failed to process subscription renewal");
  } catch (error) {
    console.error("Error processing subscription renewal:", error);

    // Check if it's a 500 error from PayMongo
    const errorMessage = String(error);
    if (
      errorMessage.includes("500") &&
      errorMessage.includes("Something went wrong on our end")
    ) {
      // For 500 errors, return a partial success that the client can handle
      console.log(
        "Handling 500 error in subscription renewal by returning partial success"
      );
      return {
        success: true,
        paymentIntentId: `error_recovery_${Date.now()}`,
        status: "requires_payment_method",
        warning:
          "Payment intent creation failed with 500 error. The subscription may need to be retried later.",
      };
    }

    throw error;
  }
};
