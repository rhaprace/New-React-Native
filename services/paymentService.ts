// Payment service for handling GCash and other payment methods
import Config from "@/config/environment";

// PayMongo API base URL
const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

// Helper function to encode Basic Auth for PayMongo API
const encodeBasicAuth = (key: string): string => {
  return btoa(`${key}:`);
};

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

// Interface for payment source creation
interface CreateSourceParams {
  amount: number;
  currency: string;
  type: "gcash" | "paymaya" | "grab_pay";
  name?: string;
  email?: string;
  phone?: string;
  redirectSuccess?: string;
  redirectFailed?: string;
}

// Interface for customer response
interface CustomerResponse {
  id: string;
  type: string;
  attributes: {
    email: string;
    name: string;
    phone: string;
    default_source: {
      id: string;
      type: string;
    };
  };
}

// Interface for payment method response
interface PaymentMethodResponse {
  id: string;
  type: string;
  attributes: {
    type: string;
    details: {
      phone?: string;
      last4?: string;
      exp_month?: number;
      exp_year?: number;
    };
    billing: {
      name: string;
      email: string;
      phone: string;
    };
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
    status: string;
    payment_method_allowed: string[];
    payment_method_options: any;
    payment_method_id: string | null;
    metadata: any;
  };
}

/**
 * Create a payment source with PayMongo
 * This is used to initiate a payment with GCash, PayMaya, etc.
 */
export const createPaymentSource = async (
  paymentType: string,
  amount: number,
  params?: Partial<CreateSourceParams>
): Promise<PaymentSourceResponse> => {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount,
            currency: params?.currency || "PHP",
            type: paymentType,
            name: params?.name,
            email: params?.email,
            phone: params?.phone,
            redirect: {
              success: params?.redirectSuccess || "https://example.com/success",
              failed: params?.redirectFailed || "https://example.com/failed",
            },
          },
        },
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If we can't parse the response as JSON, use the status text
        errorData = {
          errors: [
            {
              detail: `Failed to parse error response: ${response.statusText}`,
            },
          ],
        };
      }

      console.error("PayMongo API Error (Payment Source Creation):", {
        status: response.status,
        statusText: response.statusText,
        errors: errorData.errors,
        paymentType,
        amount,
      });

      // For 5xx errors (server errors), provide a more specific error message
      if (response.status >= 500 && response.status < 600) {
        console.log(
          "PayMongo server error during payment source creation. This is likely a temporary issue."
        );
        throw new Error(
          "PayMongo server is experiencing issues. Please try again in a few minutes."
        );
      } else {
        // For other errors, use the error detail from the API
        throw new Error(
          errorData.errors?.[0]?.detail || "Failed to create payment source"
        );
      }
    }

    const data = await response.json();
    return data.data;
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
  sourceId: string
): Promise<string | boolean> => {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
      headers: {
        Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayMongo API error:", errorText);
      throw new Error("Failed to fetch payment status");
    }

    const data = await response.json();
    console.log("Payment status response:", JSON.stringify(data));

    const status = data.data.attributes.status;

    // For compatibility with existing code that expects boolean
    if (typeof status === "string" && ["chargeable", "paid"].includes(status)) {
      return true;
    }

    return status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false; // For compatibility with existing code
  }
};

/**
 * Find a customer by email or phone in PayMongo
 * This is used to check if a customer already exists before creating a new one
 * At least one of email or phone must be provided
 */
export const findCustomerByEmail = async (
  email?: string,
  phone?: string
): Promise<string | null> => {
  try {
    // Validate that at least one parameter is provided
    if (!email && !phone) {
      console.error(
        "Error: Either email or phone must be provided to find a customer"
      );
      return null;
    }

    // Format phone number if needed
    let formattedPhone: string | undefined = undefined;
    if (phone) {
      formattedPhone = phone.startsWith("+")
        ? phone
        : phone.startsWith("0")
          ? `+63${phone.substring(1)}`
          : `+63${phone}`;
    }

    // Try to find customer by email
    if (email) {
      try {
        const emailResponse = await fetch(
          `${PAYMONGO_API_URL}/customers?filter[email]=${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
            },
          }
        );

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          if (emailData.data && emailData.data.length > 0) {
            return emailData.data[0].id;
          }
        }
      } catch (emailError) {
        console.error("Error finding customer by email:", emailError);
        // Continue to try by phone
      }
    }

    // If no customer found by email and we have a phone, try by phone
    if (formattedPhone) {
      try {
        const phoneResponse = await fetch(
          `${PAYMONGO_API_URL}/customers?filter[phone]=${encodeURIComponent(formattedPhone)}`,
          {
            headers: {
              Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
            },
          }
        );

        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          if (phoneData.data && phoneData.data.length > 0) {
            return phoneData.data[0].id;
          }
        }
      } catch (phoneError) {
        console.error("Error finding customer by phone:", phoneError);
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding customer:", error);
    return null;
  }
};

/**
 * Link a GCash account by creating or retrieving a customer in PayMongo
 * This is used to store a customer's GCash information for future payments
 */
export const linkGCashAccount = async (
  phoneNumber: string,
  name?: string,
  email?: string
): Promise<{ customerId: string; paymentMethodId: string }> => {
  try {
    // Validate required parameters
    if (!phoneNumber) {
      throw new Error("Phone number is required for GCash account linking");
    }

    const formattedPhone = phoneNumber.startsWith("0")
      ? `+63${phoneNumber.substring(1)}`
      : `+63${phoneNumber}`;
    const nameParts = (name || "User").split(" ");
    const firstName = nameParts[0] || "User";
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Account";
    const userEmail = email || "";

    // Check if customer already exists
    let customerId = null;

    // Only attempt to find existing customer if we have an email or phone
    if (userEmail || formattedPhone) {
      try {
        // Use our improved findCustomerByEmail function to look up the customer
        // This function handles the API requirements properly
        customerId = await findCustomerByEmail(userEmail, formattedPhone);

        if (customerId) {
          console.log("Found existing customer with ID:", customerId);
        } else {
          console.log("No existing customer found, will create a new one");
        }

        // If still no customer found, create a new one
        if (!customerId) {
          // Prepare customer data - ensure we have at least email or phone
          const customerData: any = {
            type: "customer",
            first_name: firstName,
            last_name: lastName,
            default_device: "phone",
          };

          if (formattedPhone) {
            customerData.phone = formattedPhone;
          }

          if (userEmail) {
            customerData.email = userEmail;
          }

          // Ensure we have at least one of email or phone
          if (!customerData.email && !customerData.phone) {
            throw new Error(
              "Either email or phone is required to create a customer"
            );
          }

          try {
            const customerResponse = await fetch(
              `${PAYMONGO_API_URL}/customers`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
                },
                body: JSON.stringify({
                  data: {
                    attributes: customerData,
                  },
                }),
              }
            );

            if (customerResponse.ok) {
              const customerData = await customerResponse.json();
              customerId = customerData.data.id;
            } else {
              const errorData = await customerResponse.json();

              // Check if this is a "resource_exists" error
              if (
                errorData.errors &&
                errorData.errors[0] &&
                errorData.errors[0].code === "resource_exists"
              ) {
                console.log(
                  "Customer already exists, trying to retrieve by email or phone"
                );

                // Try one more time to find the customer by email or phone
                // Use our improved findCustomerByEmail function which handles each parameter separately
                const existingCustomerId = await findCustomerByEmail(
                  userEmail,
                  formattedPhone
                );
                if (existingCustomerId) {
                  customerId = existingCustomerId;
                  console.log(
                    "Successfully retrieved existing customer with ID:",
                    customerId
                  );
                } else {
                  // If we still couldn't find the customer through the API,
                  // but we know it exists (from the resource_exists error),
                  // create a new customer with a slightly modified email
                  console.log(
                    "Could not retrieve existing customer, creating a new one with modified email"
                  );

                  // Modify the email by adding a timestamp
                  const timestamp = Date.now();
                  const modifiedEmail = userEmail
                    ? userEmail.replace("@", `+${timestamp}@`)
                    : `user_${timestamp}@example.com`;

                  // Create a new customer with the modified email
                  const newCustomerResponse = await fetch(
                    `${PAYMONGO_API_URL}/customers`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
                      },
                      body: JSON.stringify({
                        data: {
                          attributes: {
                            type: "customer",
                            phone: formattedPhone,
                            email: modifiedEmail,
                            first_name: firstName,
                            last_name: lastName,
                            default_device: "phone",
                          },
                        },
                      }),
                    }
                  );

                  if (newCustomerResponse.ok) {
                    const newCustomerData = await newCustomerResponse.json();
                    customerId = newCustomerData.data.id;
                    console.log(
                      "Created new customer with modified email:",
                      modifiedEmail
                    );
                  } else {
                    // If we still can't create a customer, throw an error
                    const newErrorData = await newCustomerResponse.json();
                    throw new Error(
                      newErrorData.errors?.[0]?.detail ||
                        "Failed to create customer with modified email"
                    );
                  }
                }
              } else {
                console.error("PayMongo API Error (Customer Creation):", {
                  status: customerResponse.status,
                  statusText: customerResponse.statusText,
                  errors: errorData.errors,
                  requestBody: {
                    phone: formattedPhone,
                    email: userEmail,
                    first_name: firstName,
                    last_name: lastName,
                  },
                });
                throw new Error(
                  errorData.errors?.[0]?.detail || "Failed to create customer"
                );
              }
            }
          } catch (error) {
            // If we still don't have a customerId and we caught an error
            if (!customerId) {
              throw error;
            }
          }
        }
      } catch (error) {
        console.error("Error handling customer creation/retrieval:", error);
        throw error;
      }
    } else {
      // Neither email nor phone is available, which is required by PayMongo API
      throw new Error(
        "Either email or phone is required for GCash account linking"
      );
    }

    if (!customerId) {
      throw new Error("Failed to obtain customer ID");
    }

    // Create a payment method for GCash
    // Make sure we have a valid email for billing info
    const billingEmail = userEmail || `user_${Date.now()}@example.com`;

    const paymentMethodResponse = await fetch(
      `${PAYMONGO_API_URL}/payment_methods`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: "gcash",
              details: {
                phone: formattedPhone,
              },
              billing: {
                name: `${firstName} ${lastName}`,
                email: billingEmail,
                phone: formattedPhone,
                address: {
                  line1: "Default Address",
                  city: "Manila",
                  state: "Metro Manila",
                  postal_code: "1000",
                  country: "PH",
                },
              },
              metadata: {
                customer_id: customerId,
              },
            },
          },
        }),
      }
    );

    if (!paymentMethodResponse.ok) {
      const errorData = await paymentMethodResponse.json();
      console.error("PayMongo API Error (Payment Method Creation):", errorData);
      throw new Error(
        errorData.errors?.[0]?.detail || "Failed to create payment method"
      );
    }

    const paymentMethodData = await paymentMethodResponse.json();
    const paymentMethodId = paymentMethodData.data.id;

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
            Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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
        let paymentIntentErrorData;
        try {
          paymentIntentErrorData = await paymentIntentResponse.json();
        } catch (parseError) {
          // If we can't parse the response as JSON, use the status text
          paymentIntentErrorData = {
            errors: [
              {
                detail: `Failed to parse error response: ${paymentIntentResponse.statusText}`,
              },
            ],
          };
        }

        console.error("PayMongo API Error (Payment Intent Creation):", {
          status: paymentIntentResponse.status,
          statusText: paymentIntentResponse.statusText,
          errors: paymentIntentErrorData.errors,
          requestBody: {
            amount: 100,
            payment_method_allowed: ["gcash"],
            currency: "PHP",
            description: "GCash Account Verification",
          },
        });

        // For 5xx errors (server errors), log but continue
        if (
          paymentIntentResponse.status >= 500 &&
          paymentIntentResponse.status < 600
        ) {
          console.log(
            "PayMongo server error during verification. Continuing without creating payment intent for verification."
          );
        } else {
          // For other errors, log more details but still continue
          console.log(
            `PayMongo error (${paymentIntentResponse.status}) during verification. Continuing without creating payment intent for verification.`
          );
        }
      } else {
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
              Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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
          const attachErrorData = await attachResponse.json();
          console.error(
            "PayMongo API Error (Attaching Payment Method to Payment Intent):",
            attachErrorData
          );
          // Don't throw here, we'll still return the payment method ID
          console.log("Continuing without attaching payment method");
        } else {
          console.log("Successfully attached payment method to payment intent");

          // Now that the payment method is attached, we can set it as the default
          const updateCustomerResponse = await fetch(
            `${PAYMONGO_API_URL}/customers/${customerId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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

          if (!updateCustomerResponse.ok) {
            const errorData = await updateCustomerResponse.json();
            console.error(
              "PayMongo API Error (Updating Customer Default Payment Method):",
              errorData
            );
            // Don't throw here, we'll still return the payment method ID
            console.log("Continuing without setting default payment method");
          } else {
            console.log("Successfully set default payment method");
          }
        }
      }
    } catch (error) {
      console.error("Error in payment method attachment process:", error);
      // Don't throw here, we'll still return the payment method ID
      console.log("Continuing despite payment method attachment error");
    }

    return { customerId, paymentMethodId };
  } catch (error) {
    console.error("Error linking GCash account:", error);
    throw error;
  }
};

/**
 * Create a payment intent for subscription renewal
 * This is used to charge a customer's GCash account for subscription renewal
 */
export const createSubscriptionPaymentIntent = async (
  customerId: string,
  paymentMethodId: string,
  amount: number,
  description: string = "Subscription Renewal"
): Promise<PaymentIntentResponse> => {
  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError: any = null;

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

      console.log(
        "Payment intent request payload:",
        JSON.stringify(requestPayload)
      );

      const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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

        // For 5xx errors (server errors), we should retry
        if (response.status >= 500 && response.status < 600) {
          // Log more detailed information about the server error
          console.log(
            `PayMongo server error (${response.status}) during payment intent creation. Attempt ${retryCount + 1} of ${MAX_RETRIES}.`
          );

          // Create a more descriptive error message
          const errorDetail =
            errorData.errors?.[0]?.detail ||
            `Server error (${response.status})`;
          lastError = new Error(errorDetail);

          // Add additional context to the error
          if (errorDetail.includes("Something went wrong on our end")) {
            console.log(
              "This is a known PayMongo server issue. Will retry with exponential backoff."
            );
          }

          retryCount++;

          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Waiting ${waitTime}ms before retry ${retryCount}`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // For other errors, throw immediately with more context
        const errorMessage =
          errorData.errors?.[0]?.detail ||
          `Failed to create payment intent (${response.status})`;

        console.log(`PayMongo API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const paymentIntentId = data.data.id;
      console.log(`Successfully created payment intent: ${paymentIntentId}`);

      // Now attach the payment method to the intent
      const attachResponse = await fetch(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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
        let errorData;
        try {
          errorData = await attachResponse.json();
        } catch (parseError) {
          errorData = { errors: [{ detail: attachResponse.statusText }] };
        }

        console.error(
          "PayMongo API Error (Attaching Payment Method to Intent):",
          {
            status: attachResponse.status,
            statusText: attachResponse.statusText,
            errors: errorData.errors,
            paymentIntentId,
          }
        );

        throw new Error(
          errorData.errors?.[0]?.detail ||
            `Failed to attach payment method to payment intent (${attachResponse.status})`
        );
      }

      const attachData = await attachResponse.json();
      return attachData.data;
    } catch (error) {
      lastError = error;
      console.error(
        `Error in attempt ${retryCount + 1} creating subscription payment intent:`,
        error
      );

      // Only retry for certain types of errors (like network errors or server errors)
      if (
        error instanceof TypeError ||
        (error instanceof Error && error.message.includes("Server error"))
      ) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`Waiting ${waitTime}ms before retry ${retryCount}`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
      } else {
        // For other types of errors, don't retry
        break;
      }
    }
  }

  // If we've exhausted all retries or encountered a non-retryable error
  console.error(`Failed to create payment intent after ${retryCount} retries`);
  throw (
    lastError ||
    new Error("Failed to create payment intent after multiple attempts")
  );
};

/**
 * Check the status of a payment intent
 * This is used to verify if a subscription payment has been completed
 */
export const checkPaymentIntentStatus = async (
  paymentIntentId: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Basic ${encodeBasicAuth(Config.paymongoSecretKey)}`,
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
};

/**
 * Process a subscription renewal payment
 * This is used to charge a customer's GCash account for subscription renewal
 */
export const processSubscriptionRenewal = async (
  customerId: string,
  paymentMethodId: string,
  amount: number,
  isPromo: boolean = false
): Promise<{ success: boolean; paymentIntentId: string; status: string }> => {
  try {
    const description = isPromo
      ? "AtleTech Subscription - Promo Rate ₱75"
      : "AtleTech Subscription - Regular Rate ₱200";

    console.log(
      `Processing subscription renewal for customer ${customerId} with payment method ${paymentMethodId}`
    );
    console.log(
      `Amount: ${amount}, Promo: ${isPromo}, Description: ${description}`
    );

    try {
      const paymentIntent = await createSubscriptionPaymentIntent(
        customerId,
        paymentMethodId,
        amount,
        description
      );
      const status = paymentIntent.attributes.status;
      const success = status === "succeeded" || status === "processing";

      console.log(
        `Payment intent created successfully. Status: ${status}, ID: ${paymentIntent.id}`
      );

      return {
        success,
        paymentIntentId: paymentIntent.id,
        status,
      };
    } catch (paymentError) {
      // If we get a server error from PayMongo, return a partial success
      // This will allow the system to retry later rather than marking the subscription as failed
      if (
        paymentError instanceof Error &&
        (paymentError.message.includes("Server error") ||
          paymentError.message.includes("Something went wrong on our end") ||
          paymentError.message.includes("500"))
      ) {
        console.warn(
          "PayMongo server error during subscription renewal. Will retry later:",
          {
            error: paymentError.message,
            customerId,
            paymentMethodId,
            amount,
            isPromo,
          }
        );

        // Log additional information to help with debugging
        console.log(
          "This is a temporary server error from PayMongo. The subscription system will automatically retry later."
        );

        // Return a special status that indicates a temporary failure
        return {
          success: false,
          paymentIntentId: `error_${Date.now()}`,
          status: "paymongo_server_error",
        };
      }

      // For other errors, log details and rethrow
      console.error("Non-server error during subscription renewal:", {
        error:
          paymentError instanceof Error
            ? paymentError.message
            : String(paymentError),
        customerId,
        paymentMethodId,
        amount,
        isPromo,
      });

      throw paymentError;
    }
  } catch (error) {
    console.error("Error processing subscription renewal:", error);

    // Return a failed status instead of throwing
    // This allows the calling code to handle the error more gracefully
    return {
      success: false,
      paymentIntentId: `error_${Date.now()}`,
      status: error instanceof Error ? error.message : "unknown_error",
    };
  }
};
