import { action } from "./_generated/server";
import { v } from "convex/values";

// Interface for payment source response
interface PaymentSourceResponse {
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
interface PaymentMethodResponse {
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
interface PaymentIntentResponse {
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

// Helper function to encode Basic Auth for PayMongo API
const encodeBasicAuth = (key: string): string => {
  return Buffer.from(`${key}:`).toString("base64");
};

/**
 * Create a payment source with PayMongo
 * This is used to initiate a payment with GCash, PayMaya, etc.
 */
export const createPaymentSource = action({
  args: {
    paymentType: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    successUrl: v.string(),
    failedUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const {
        paymentType,
        amount,
        description,
        name,
        email,
        phone,
        successUrl,
        failedUrl,
      } = args;

      const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount,
              redirect: {
                success: successUrl,
                failed: failedUrl,
              },
              type: paymentType,
              currency: "PHP",
              description: description || "Payment for Atletech subscription",
              billing: name
                ? {
                    name,
                    email,
                    phone,
                  }
                : undefined,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);
        throw new Error(`Failed to create payment source: ${errorText}`);
      }

      const data = await response.json();
      return data.data as PaymentSourceResponse;
    } catch (error) {
      console.error("Error creating payment source:", error);
      throw error;
    }
  },
});

/**
 * Check the status of a payment source
 * This is used to verify if a payment has been completed
 */
export const checkPaymentStatus = action({
  args: {
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { sourceId } = args;

      const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
        headers: {
          Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);
        throw new Error("Failed to fetch payment status");
      }

      const data = await response.json();
      return data.data.attributes.status;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  },
});

/**
 * Create a PayMongo customer
 * This is used for recurring payments
 */
export const createCustomer = action({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    defaultDevice: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { email, name, phone, defaultDevice } = args;

      // Validate that either email or phone is provided
      if (!email && !phone) {
        throw new Error("Either email or phone must be provided");
      }

      const response = await fetch(`${PAYMONGO_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              email,
              name,
              phone,
              default_device: defaultDevice,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      const data = await response.json();
      return data.data.id;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },
});

/**
 * Create a payment method for a customer
 * This is used for recurring payments
 */
export const createPaymentMethod = action({
  args: {
    customerId: v.string(),
    type: v.string(),
    details: v.any(),
    billingInfo: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { customerId, type, details, billingInfo } = args;

      const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type,
              details,
              billing: billingInfo,
              metadata: {
                customer_id: customerId,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);
        throw new Error(`Failed to create payment method: ${errorText}`);
      }

      const data = await response.json();
      return data.data as PaymentMethodResponse;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  },
});

/**
 * Attach a payment method to a customer
 * This is used for recurring payments
 */
export const attachPaymentMethod = action({
  args: {
    customerId: v.string(),
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { customerId, paymentMethodId } = args;

      // According to PayMongo API, we need to attach the payment method to the customer
      // before setting it as the default payment method
      try {
        // First, create a payment intent for a small amount to attach the payment method
        const paymentIntentResponse = await fetch(
          `${PAYMONGO_API_URL}/payment_intents`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  amount: 100, // Minimum amount (1 PHP)
                  payment_method_allowed: ["gcash"],
                  payment_method_options: {
                    gcash: {
                      description: "GCash Account Verification",
                    },
                  },
                  currency: "PHP",
                  capture_type: "automatic",
                  statement_descriptor: "ATLETECH VERIFICATION",
                  description: "GCash Account Verification",
                  metadata: {
                    customer_id: customerId,
                    verification: true,
                  },
                },
              },
            }),
          }
        );

        if (!paymentIntentResponse.ok) {
          const errorText = await paymentIntentResponse.text();
          console.error("PayMongo API error (Payment Intent):", errorText);
          throw new Error(`Failed to create payment intent: ${errorText}`);
        }

        const paymentIntentData = await paymentIntentResponse.json();
        const paymentIntentId = paymentIntentData.data.id;
        const clientKey = paymentIntentData.data.attributes.client_key;

        // Now attach the payment method to the payment intent
        const attachResponse = await fetch(
          `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  payment_method: paymentMethodId,
                  client_key: clientKey,
                  return_url: "https://example.com/success",
                },
              },
            }),
          }
        );

        if (!attachResponse.ok) {
          const errorText = await attachResponse.text();
          console.error("PayMongo API error (Attach):", errorText);
          throw new Error(`Failed to attach payment method: ${errorText}`);
        }

        // Now set the payment method as the default for the customer
        const setDefaultResponse = await fetch(
          `${PAYMONGO_API_URL}/customers/${customerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  default_payment_method_id: paymentMethodId,
                },
              },
            }),
          }
        );

        if (!setDefaultResponse.ok) {
          const errorText = await setDefaultResponse.text();
          console.error("PayMongo API error (Set Default):", errorText);
          throw new Error(`Failed to set default payment method: ${errorText}`);
        }

        return {
          success: true,
          customerId,
          paymentMethodId,
        };
      } catch (error) {
        console.error("Error attaching payment method:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in attachPaymentMethod:", error);
      throw error;
    }
  },
});

/**
 * Create a payment intent for subscription
 * This is used for recurring payments
 */
export const createPaymentIntent = action({
  args: {
    customerId: v.string(),
    paymentMethodId: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { customerId, paymentMethodId, amount, description } = args;
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let lastError = null;

      while (retryCount < MAX_RETRIES) {
        try {
          console.log(
            `Attempt ${retryCount + 1} to create payment intent for customer ${customerId}`
          );

          // Log the request payload for debugging
          const requestPayload = {
            data: {
              attributes: {
                amount: amount,
                payment_method_allowed: ["gcash"],
                payment_method_options: {
                  gcash: {
                    description: description,
                  },
                },
                currency: "PHP",
                capture_type: "automatic",
                statement_descriptor: "ATLETECH SUBSCRIPTION",
                description: description,
                metadata: {
                  customer_id: customerId,
                  subscription: true,
                  retry_count: retryCount,
                  client_timestamp: new Date().toISOString(),
                },
              },
            },
          };

          const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify(requestPayload),
          });

          // Handle non-OK responses
          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (parseError) {
              // If we can't parse the response as JSON, use the status text
              errorData = { errors: [{ detail: response.statusText }] };
            }

            console.error("PayMongo API Error (Payment Intent Creation):", {
              status: response.status,
              statusText: response.statusText,
              errors: errorData.errors,
              retryCount,
              customerId,
              amount,
            });

            lastError = new Error(
              `Failed to create payment intent: ${
                errorData.errors?.[0]?.detail || response.statusText
              }`
            );

            // Increment retry count and try again
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * Math.pow(2, retryCount))
              );
              continue;
            } else {
              throw lastError;
            }
          }

          const data = await response.json();
          const paymentIntentId = data.data.id;
          console.log(
            `Successfully created payment intent: ${paymentIntentId}`
          );

          // Now attach the payment method to the intent
          const attachResponse = await fetch(
            `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
              },
              body: JSON.stringify({
                data: {
                  attributes: {
                    payment_method: paymentMethodId,
                    return_url: "https://example.com/success",
                  },
                },
              }),
            }
          );

          if (!attachResponse.ok) {
            const errorText = await attachResponse.text();
            console.error("PayMongo API error (Attach):", errorText);
            throw new Error(`Failed to attach payment method: ${errorText}`);
          }

          const attachData = await attachResponse.json();
          return {
            success: true,
            paymentIntentId: paymentIntentId,
            status: attachData.data.attributes.status,
          };
        } catch (error) {
          lastError = error;
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retryCount))
            );
            continue;
          }
          break;
        }
      }

      // If we've exhausted all retries, throw the last error
      throw lastError;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  },
});

/**
 * Check the status of a payment intent
 * This is used to verify if a subscription payment has been completed
 */
export const checkPaymentIntentStatus = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
      const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { paymentIntentId } = args;

      const response = await fetch(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
        {
          headers: {
            Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);
        throw new Error("Failed to fetch payment intent status");
      }

      const data = await response.json();
      return data.data.attributes.status;
    } catch (error) {
      console.error("Error checking payment intent status:", error);
      throw error;
    }
  },
});
