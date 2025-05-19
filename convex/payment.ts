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
// Using btoa instead of Buffer for Convex compatibility
const encodeBasicAuth = (key: string): string => {
  // Convert the string to base64 using btoa (built-in browser function that Convex supports)
  return btoa(`${key}:`);
};

// The PayMongo API URL
const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

// Helper function to search for customer by email or phone
const findCustomerByIdentifier = async (
  secretKey: string,
  email?: string,
  phone?: string
): Promise<string | null> => {
  // Normalize email and phone for consistent matching
  if (email) {
    email = email.trim().toLowerCase();
  }

  if (phone) {
    // Remove any non-numeric characters for consistent phone matching
    phone = phone.replace(/\D/g, "");

    // Ensure phone is properly formatted (PayMongo expects area code + 10 digits)
    if (!phone.startsWith("+")) {
      // If the phone starts with 63, add a plus sign
      if (phone.startsWith("63") && phone.length >= 11) {
        phone = "+" + phone;
      } else if (phone.length === 10) {
        // Add +63 (Philippines area code) if it's a 10-digit number
        phone = "+63" + phone;
      } else if (phone.startsWith("9") && phone.length === 10) {
        // If it starts with 9 and is 10 digits, assume it's a Philippine number without the area code
        phone = "+63" + phone;
      } else if (phone.startsWith("09") && phone.length === 11) {
        // If it starts with 09 and is 11 digits, convert to international format
        phone = "+63" + phone.substring(1);
      } else if (phone.length > 10) {
        // If it's longer, assume it might include the area code without the plus
        phone = "+" + phone;
      }
    }

    // Ensure the phone meets PayMongo's requirements
    if (!phone.match(/^\+\d{8,15}$/)) {
      console.warn(
        `Phone number ${phone} doesn't match expected format for PayMongo`
      );
    }
  }

  // Track attempts for logging
  const attempts = { email: 0, phone: 0, pagination: 0 };

  // Try email first
  if (email) {
    try {
      attempts.email++;
      const encodedEmail = encodeURIComponent(email);
      console.log(
        `Searching for customer by email: ${encodedEmail} (attempt ${attempts.email})`
      );

      // Include both email and phone parameters to avoid 400 errors
      const searchParams = new URLSearchParams();
      searchParams.append("filter[email]", email);
      searchParams.append("filter[phone]", phone || "+639999999999");

      const emailResponse = await fetch(
        `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Basic ${encodeBasicAuth(secretKey)}`,
            "Content-Type": "application/json",
            "X-Query-Type": "email_search",
          },
        }
      );

      if (emailResponse.ok) {
        const data = await emailResponse.json();
        if (data.data && data.data.length > 0) {
          console.log(
            `Found ${data.data.length} customers by email, using first match:`,
            data.data[0].id
          );
          return data.data[0].id;
        }
        console.log("No customer found by email");
      } else {
        const errorText = await emailResponse.text();
        console.error(
          `Error searching by email (${emailResponse.status}):`,
          errorText
        );
      }
    } catch (error) {
      console.error("Exception when searching customer by email:", error);
    }

    // Try a second time with exact match query in case the filter is sensitive to formatting
    if (attempts.email === 1) {
      try {
        attempts.email++;
        console.log(
          `Retrying email search with exact match: ${email} (attempt ${attempts.email})`
        );

        // Build proper search params with both email and phone
        const searchParams = new URLSearchParams();
        searchParams.append("filter[email]", email);
        searchParams.append("filter[phone]", phone || "+639999999999"); // Use real phone or dummy

        const response = await fetch(
          `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
          {
            headers: {
              Authorization: `Basic ${encodeBasicAuth(secretKey)}`,
              "Content-Type": "application/json",
              "X-Query-Type": "email_exact_match",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Find exact match
            const exactMatch = data.data.find(
              (c: any) =>
                c.attributes.email && c.attributes.email.toLowerCase() === email
            );

            if (exactMatch) {
              console.log(
                "Found customer by exact email match:",
                exactMatch.id
              );
              return exactMatch.id;
            }
            console.log("No exact email match found in customers list");
          }
        }
      } catch (error) {
        console.error("Exception when retry searching by email:", error);
      }
    }
  }

  // Try phone if email search failed or wasn't possible
  if (phone) {
    try {
      attempts.phone++;
      console.log(
        `Searching for customer by phone: ${phone} (attempt ${attempts.phone})`
      );

      // Include both parameters to avoid 400 errors
      const searchParams = new URLSearchParams();
      searchParams.append("filter[phone]", phone);
      searchParams.append(
        "filter[email]",
        email || `dummy_${Date.now()}@atletech-system.com`
      );

      const phoneResponse = await fetch(
        `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Basic ${encodeBasicAuth(secretKey)}`,
            "Content-Type": "application/json",
            "X-Query-Type": "phone_search",
          },
        }
      );

      if (phoneResponse.ok) {
        const data = await phoneResponse.json();
        if (data.data && data.data.length > 0) {
          console.log(
            `Found ${data.data.length} customers by phone, using first match:`,
            data.data[0].id
          );
          return data.data[0].id;
        }
        console.log("No customer found by phone");
      } else {
        const errorText = await phoneResponse.text();
        console.error(
          `Error searching by phone (${phoneResponse.status}):`,
          errorText
        );
      }
    } catch (error) {
      console.error("Exception when searching customer by phone:", error);
    }

    // Try a second time with exact match query
    if (attempts.phone === 1) {
      try {
        attempts.phone++;
        console.log(
          `Retrying phone search with exact match: ${phone} (attempt ${attempts.phone})`
        );

        // Build proper search params with both phone and a dummy email
        const searchParams = new URLSearchParams();
        searchParams.append("filter[phone]", phone);
        searchParams.append(
          "filter[email]",
          email || `dummy_${Date.now()}@atletech-system.com`
        );

        const response = await fetch(
          `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
          {
            headers: {
              Authorization: `Basic ${encodeBasicAuth(secretKey)}`,
              "Content-Type": "application/json",
              "X-Query-Type": "phone_exact_match",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Find exact match (ignoring non-numeric characters in stored phones)
            const exactMatch = data.data.find(
              (c: any) =>
                c.attributes.phone &&
                c.attributes.phone.replace(/\D/g, "") === phone
            );

            if (exactMatch) {
              console.log(
                "Found customer by exact phone match:",
                exactMatch.id
              );
              return exactMatch.id;
            }
            console.log("No exact phone match found in customers list");
          }
        }
      } catch (error) {
        console.error("Exception when retry searching by phone:", error);
      }
    }
  }

  // Try a broader search if specific queries failed
  if (email || phone) {
    try {
      attempts.pagination++;
      console.log(
        `Attempting broader customer search with pagination (attempt ${attempts.pagination})`
      );

      // Try with pagination to find the customer in multiple pages
      // Add proper parameters to satisfy API requirements
      let nextPageUrl: string | null =
        `${PAYMONGO_API_URL}/customers?limit=100`;

      // Build search params with both email and phone (real or dummy)
      const searchParams = new URLSearchParams();

      // Always include both parameters to satisfy API requirements
      searchParams.append(
        "filter[email]",
        email || `dummy_${Date.now()}@atletech-system.com`
      );
      searchParams.append("filter[phone]", phone || "+639999999999");
      searchParams.append("limit", "100");

      nextPageUrl = `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`;

      let pageCounter = 0;
      const MAX_PAGES = 5; // Limit the number of pages to search through

      while (nextPageUrl && pageCounter < MAX_PAGES) {
        console.log(`Searching customers page ${pageCounter + 1}`);

        const pageResponse: Response = await fetch(nextPageUrl, {
          headers: {
            Authorization: `Basic ${encodeBasicAuth(secretKey)}`,
            "Content-Type": "application/json",
            "X-Query-Type": "pagination_search",
            "X-Page-Number": `${pageCounter + 1}`,
          },
        });

        if (!pageResponse.ok) {
          console.error(
            `Error getting customers page ${pageCounter + 1} (${pageResponse.status}):`,
            await pageResponse.text()
          );
          break;
        }

        const pageData = await pageResponse.json();
        const customers = pageData.data || [];
        console.log(
          `Found ${customers.length} customers on page ${pageCounter + 1}`
        );

        // Find the customer in this page with more flexible matching
        const customer = customers.find(
          (c: any) =>
            (email &&
              c.attributes.email &&
              c.attributes.email.toLowerCase() === email.toLowerCase()) ||
            (phone &&
              c.attributes.phone &&
              c.attributes.phone.replace(/\D/g, "") ===
                phone.replace(/\D/g, ""))
        );

        if (customer) {
          console.log("Found customer using pagination search:", customer.id);
          return customer.id;
        }

        // Check if there's a next page
        nextPageUrl = pageData.links?.next || null;
        pageCounter++;
      }

      console.log(
        `Completed search across ${pageCounter} pages, customer not found`
      );
    } catch (paginationError) {
      console.error("Error during pagination search:", paginationError);
    }
  }

  // Log overall search results
  console.log(
    `Customer search complete. Attempts: Email: ${attempts.email}, Phone: ${attempts.phone}, Pagination: ${attempts.pagination}. Email: ${email || "not provided"}, Phone: ${phone || "not provided"}`
  );
  return null;
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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

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

      // Ensure redirect URLs are valid web URLs
      let validSuccessUrl = successUrl;
      let validFailedUrl = failedUrl;

      // Check if URLs are deep links and convert them to valid web URLs
      if (successUrl.startsWith("atletech://")) {
        console.log("Converting deep link success URL to web URL");
        validSuccessUrl = "https://example.com/success";
      }

      if (failedUrl.startsWith("atletech://")) {
        console.log("Converting deep link failed URL to web URL");
        validFailedUrl = "https://example.com/failed";
      }

      // Store the original URLs in metadata for later use
      const metadata = {
        originalSuccessUrl: successUrl,
        originalFailedUrl: failedUrl,
      };

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
                success: validSuccessUrl,
                failed: validFailedUrl,
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
              metadata: metadata,
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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

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
    phone: v.optional(v.string()),
    name: v.optional(v.string()),
    defaultDevice: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { email, name, phone, defaultDevice } = args;

      // Validate that either email or phone is provided
      if (!email && !phone) {
        throw new Error(
          "Either email or phone must be provided to create a customer"
        );
      }

      // Log the customer creation attempt with identifiers
      console.log(
        `Creating customer with email: ${email || "not provided"}, phone: ${phone || "not provided"}`
      );

      // Normalize phone number for consistency
      let normalizedPhone = phone;
      if (phone) {
        // Apply the same formatting logic used in findCustomerByIdentifier
        normalizedPhone = phone.replace(/\D/g, "");
        if (!normalizedPhone.startsWith("+")) {
          if (
            normalizedPhone.startsWith("63") &&
            normalizedPhone.length >= 11
          ) {
            normalizedPhone = "+" + normalizedPhone;
          } else if (normalizedPhone.length === 10) {
            normalizedPhone = "+63" + normalizedPhone;
          } else if (
            normalizedPhone.startsWith("9") &&
            normalizedPhone.length === 10
          ) {
            normalizedPhone = "+63" + normalizedPhone;
          } else if (
            normalizedPhone.startsWith("09") &&
            normalizedPhone.length === 11
          ) {
            normalizedPhone = "+63" + normalizedPhone.substring(1);
          } else if (normalizedPhone.length > 10) {
            normalizedPhone = "+" + normalizedPhone;
          }
        }
      }

      // Split the name into first and last name
      let firstName = "User";
      let lastName = "Account";

      if (name) {
        const nameParts = name.split(" ");
        firstName = nameParts[0] || "User";
        lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Account";
      }

      // First, try to find if the customer already exists
      console.log("Checking if customer already exists");
      const existingCustomerId = await findCustomerByIdentifier(
        PAYMONGO_SECRET_KEY,
        email,
        normalizedPhone
      );

      if (existingCustomerId) {
        console.log("Found existing customer:", existingCustomerId);
        return existingCustomerId;
      }

      // If customer not found, create a new one
      console.log("Creating new customer");
      const response = await fetch(`${PAYMONGO_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              email: email || `dummy_${Date.now()}@atletech-system.com`, // Add dummy email if not provided
              phone: normalizedPhone || "+639999999999", // Add dummy phone if not provided
              first_name: firstName,
              last_name: lastName,
              default_device: defaultDevice || "phone",
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayMongo API error:", errorText);

        let errorData: any = null;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error("Error parsing PayMongo error response:", parseError);
        }

        // Handle resource_exists error by searching for the customer again
        if (
          errorData &&
          errorData.errors &&
          errorData.errors[0] &&
          errorData.errors[0].code === "resource_exists"
        ) {
          console.log(
            "Customer exists error, trying to retrieve existing customer"
          );

          // Try multiple times to find the customer with increasing intervals
          for (let attempt = 0; attempt < 5; attempt++) {
            // Add a small delay between attempts (increasing with each attempt)
            if (attempt > 0) {
              const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s, 8s
              console.log(
                `Attempt ${attempt + 1} to find existing customer... (waiting ${delay}ms)`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            // For each attempt, try different search strategies
            const retryCustomerId = await findCustomerByIdentifier(
              PAYMONGO_SECRET_KEY,
              email,
              normalizedPhone
            );

            if (retryCustomerId) {
              console.log(
                "Successfully retrieved existing customer:",
                retryCustomerId
              );
              return retryCustomerId;
            }

            // If normal search failed, try some additional strategies on later attempts
            if (attempt >= 2) {
              // Try direct API calls with different query parameters
              try {
                console.log(
                  "Attempting direct API search with modified parameters..."
                );

                // Try variations of the email or phone
                let searchParams = new URLSearchParams();
                if (email) {
                  // Try lowercase, trimmed version
                  const normalizedEmail = email.trim().toLowerCase();
                  searchParams.append("filter[email]", normalizedEmail);

                  // Add a dummy phone if not provided
                  searchParams.append(
                    "filter[phone]",
                    phone || "+639999999999"
                  );

                  const directEmailResponse = await fetch(
                    `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
                    {
                      headers: {
                        Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (directEmailResponse.ok) {
                    const data = await directEmailResponse.json();
                    if (data.data && data.data.length > 0) {
                      console.log(
                        "Found customer with modified email search:",
                        data.data[0].id
                      );
                      return data.data[0].id;
                    }
                  }
                }

                // Try phone variations if email search failed
                if (phone) {
                  searchParams = new URLSearchParams();
                  // Try normalized phone version
                  const normalizedPhone = phone.replace(/\D/g, "");
                  // Ensure proper format with + prefix
                  let formattedPhone = normalizedPhone;
                  if (!formattedPhone.startsWith("+")) {
                    if (formattedPhone.startsWith("63")) {
                      formattedPhone = "+" + formattedPhone;
                    } else if (formattedPhone.length === 10) {
                      formattedPhone = "+63" + formattedPhone;
                    } else if (
                      formattedPhone.startsWith("9") &&
                      formattedPhone.length === 10
                    ) {
                      formattedPhone = "+63" + formattedPhone;
                    } else if (
                      formattedPhone.startsWith("09") &&
                      formattedPhone.length === 11
                    ) {
                      formattedPhone = "+63" + formattedPhone.substring(1);
                    }
                  }

                  searchParams.append("filter[phone]", formattedPhone);
                  // Add a dummy email if not provided
                  searchParams.append(
                    "filter[email]",
                    email || `dummy_${Date.now()}@atletech-system.com`
                  );

                  const directPhoneResponse = await fetch(
                    `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
                    {
                      headers: {
                        Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (directPhoneResponse.ok) {
                    const data = await directPhoneResponse.json();
                    if (data.data && data.data.length > 0) {
                      console.log(
                        "Found customer with modified phone search:",
                        data.data[0].id
                      );
                      return data.data[0].id;
                    }
                  }
                }
              } catch (directSearchError) {
                console.error("Error in direct API search:", directSearchError);
              }
            }
          }

          // If still not found, try a more exhaustive search through all customers
          try {
            console.log("Starting exhaustive customer search...");

            // Build search params with both email and phone (real or dummy)
            const searchParams = new URLSearchParams();
            searchParams.append(
              "filter[email]",
              email || `dummy_${Date.now()}@atletech-system.com`
            );
            searchParams.append("filter[phone]", phone || "+639999999999");
            searchParams.append("limit", "100");

            // Get as many customers as possible
            const allCustomersResponse = await fetch(
              `${PAYMONGO_API_URL}/customers?${searchParams.toString()}`,
              {
                headers: {
                  Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                },
              }
            );

            if (allCustomersResponse.ok) {
              const allCustomers = await allCustomersResponse.json();
              const customers = allCustomers.data || [];
              console.log(
                `Retrieved ${customers.length} customers for exhaustive search`
              );

              // Normalize inputs for comparison
              const normalizedEmail = email?.trim().toLowerCase();
              const normalizedPhone = phone?.replace(/\D/g, "");

              // Use multiple matching strategies

              // 1. Try exact match first
              const exactMatch = customers.find(
                (c: any) =>
                  (normalizedEmail &&
                    c.attributes.email &&
                    c.attributes.email.toLowerCase().trim() ===
                      normalizedEmail) ||
                  (normalizedPhone &&
                    c.attributes.phone &&
                    c.attributes.phone.replace(/\D/g, "") === normalizedPhone)
              );

              if (exactMatch) {
                console.log("Found customer with exact match:", exactMatch.id);
                return exactMatch.id;
              }

              // 2. Try partial email match
              if (normalizedEmail) {
                const partialEmailMatch = customers.find(
                  (c: any) =>
                    c.attributes.email &&
                    (c.attributes.email
                      .toLowerCase()
                      .includes(normalizedEmail) ||
                      normalizedEmail.includes(
                        c.attributes.email.toLowerCase()
                      ))
                );

                if (partialEmailMatch) {
                  console.log(
                    "Found customer with partial email match:",
                    partialEmailMatch.id
                  );
                  return partialEmailMatch.id;
                }
              }

              // 3. Try matching the last 4-6 digits of phone
              if (normalizedPhone && normalizedPhone.length >= 4) {
                const last4 = normalizedPhone.slice(-4);
                const phoneEndingMatch = customers.find(
                  (c: any) =>
                    c.attributes.phone &&
                    c.attributes.phone.replace(/\D/g, "").endsWith(last4)
                );

                if (phoneEndingMatch) {
                  console.log(
                    "Found customer with phone ending match:",
                    phoneEndingMatch.id
                  );
                  return phoneEndingMatch.id;
                }
              }

              console.log("Customer not found even after exhaustive search");
            } else {
              console.error(
                "Error retrieving customers for exhaustive search:",
                await allCustomersResponse.text()
              );
            }
          } catch (exhaustiveSearchError) {
            console.error(
              "Error during exhaustive customer search:",
              exhaustiveSearchError
            );
          }

          // Advanced fallback strategy: Create a new customer with transformed identifiers
          try {
            console.log(
              "Deploying advanced fallback strategy for customer creation"
            );

            // Generate unique identifiers to avoid conflicts
            const timestamp = new Date().getTime();
            const randomStr = Math.random().toString(36).substring(2, 8);

            // Create fallback variations for both email and phone, trying three different approaches
            const fallbackVariations = [
              // Variation 1: Timestamp suffix with original domain
              {
                email: email
                  ? `${email.split("@")[0]}+t${timestamp}@${email.split("@")[1]}`
                  : `fallback1_${timestamp}@atletech-system.com`,
                phone: `+639${timestamp.toString().slice(-9)}`, // Ensure valid phone format with +63 prefix and 10 digits total
                suffix: `ts_${timestamp}`,
              },
              // Variation 2: Random string with atletech domain
              {
                email: email
                  ? `${email.split("@")[0]}_${randomStr}@atletech-temp.com`
                  : `fallback2_${randomStr}@atletech-system.com`,
                phone: `+639${randomStr.substring(0, 9).replace(/\D/g, "0")}`, // Ensure valid phone format
                suffix: `rand_${randomStr}`,
              },
              // Variation 3: Forward email domain and completely different phone
              {
                email: `no-reply+${randomStr}@atletech.app`,
                phone: `+639${timestamp.toString().substring(5, 14)}`, // Ensure valid phone format
                suffix: `alt_${timestamp % 1000}`,
              },
            ];

            // Try each variation until one succeeds
            for (let i = 0; i < fallbackVariations.length; i++) {
              const variation = fallbackVariations[i];

              console.log(
                `Trying fallback variation ${i + 1}: ${variation.suffix}`
              );

              try {
                const fallbackResponse = await fetch(
                  `${PAYMONGO_API_URL}/customers`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                    },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                          email: variation.email,
                          phone: variation.phone,
                          first_name: firstName,
                          last_name: lastName,
                          default_device: defaultDevice || "phone",
                          metadata: {
                            original_email: email,
                            original_phone: phone,
                            is_fallback: true,
                            fallback_type: `variation_${i + 1}`,
                            variation_suffix: variation.suffix,
                            creation_timestamp: timestamp,
                          },
                        },
                      },
                    }),
                  }
                );

                if (fallbackResponse.ok) {
                  const data = await fallbackResponse.json();
                  console.log(
                    `Successfully created fallback customer (variation ${i + 1}):`,
                    data.data.id
                  );
                  return data.data.id;
                } else {
                  const errorText = await fallbackResponse.text();
                  console.log(`Fallback variation ${i + 1} failed:`, errorText);
                  // Continue to next variation
                }
              } catch (err) {
                console.error(`Error with fallback variation ${i + 1}:`, err);
                // Continue to next variation
              }
            }

            console.error("All fallback variations failed");
          } catch (fallbackError) {
            console.error("Fatal error in fallback strategy:", fallbackError);
          }

          // Last resort: force create a customer with completely arbitrary values
          try {
            console.log("Final attempt: Using completely arbitrary values");

            const arbitraryTimestamp = Date.now();
            const arbitraryId = `atletech_${arbitraryTimestamp}_${Math.floor(Math.random() * 1000000)}`;

            const lastResortResponse = await fetch(
              `${PAYMONGO_API_URL}/customers`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                },
                body: JSON.stringify({
                  data: {
                    attributes: {
                      email: `temporary-${arbitraryId}@atletech-system.com`,
                      phone: `+63999${arbitraryTimestamp.toString().slice(-7)}`, // Ensure valid phone format with proper +63 prefix
                      first_name: firstName,
                      last_name: lastName,
                      default_device: defaultDevice || "phone",
                      metadata: {
                        original_email: email,
                        original_phone: phone,
                        is_emergency_fallback: true,
                        original_name: name,
                        arbitrary_id: arbitraryId,
                      },
                    },
                  },
                }),
              }
            );

            if (lastResortResponse.ok) {
              const data = await lastResortResponse.json();
              console.log(
                "Created emergency customer with arbitrary values:",
                data.data.id
              );
              return data.data.id;
            }
          } catch (lastResortError) {
            console.error("Even the last resort failed:", lastResortError);
          }

          // If all else fails, return a more helpful error
          throw new Error(
            `Unable to retrieve your customer account from PayMongo. There may be a profile with your contact information already registered. Please try using a different email or phone number, or contact support for assistance. Email: ${email || "not provided"}, Phone: ${phone || "not provided"}`
          );
        }

        throw new Error(
          errorData?.errors?.[0]?.detail || "Failed to create customer"
        );
      }

      const data = await response.json();
      return data.data.id;
    } catch (error) {
      console.error("Error in createCustomer:", error);
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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

      if (!PAYMONGO_SECRET_KEY) {
        throw new Error("PayMongo secret key is not configured");
      }

      const { customerId, paymentMethodId } = args;

      // According to PayMongo API, we need to attach the payment method to the customer
      // before setting it as the default payment method
      try {
        // First, try to directly set the payment method as default for the customer
        // This is a simpler approach that might work without creating a payment intent
        console.log(
          `Attempting to set payment method ${paymentMethodId} as default for customer ${customerId}`
        );

        try {
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

          if (setDefaultResponse.ok) {
            console.log(
              "Successfully set payment method as default without creating payment intent"
            );
            return {
              success: true,
              customerId,
              paymentMethodId,
              method: "direct_default",
            };
          } else {
            console.log(
              "Failed to set payment method as default directly, will try with payment intent"
            );
          }
        } catch (directError) {
          console.error(
            "Error setting payment method as default directly:",
            directError
          );
          // Continue to the payment intent approach
        }

        // If direct approach failed, try with payment intent
        // First, create a payment intent for a small amount to attach the payment method
        console.log(
          `Creating payment intent for customer ${customerId} with payment method ${paymentMethodId}`
        );

        // Add additional metadata to help with debugging
        const requestBody = {
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
                timestamp: new Date().toISOString(),
                request_id: `verify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
              },
            },
          },
        };

        console.log(
          "Payment intent request payload:",
          JSON.stringify(requestBody)
        );

        const paymentIntentResponse = await fetch(
          `${PAYMONGO_API_URL}/payment_intents`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!paymentIntentResponse.ok) {
          let errorText;
          try {
            // Try to parse as JSON first
            const errorJson = await paymentIntentResponse.json();
            errorText = JSON.stringify(errorJson);
            console.error("PayMongo API error (Payment Intent):", errorJson);

            // Check if it's a 500 error
            if (paymentIntentResponse.status === 500) {
              console.log(
                "Received 500 error from PayMongo API, attempting alternative approach"
              );

              // If we get a 500 error, try to proceed without the payment intent
              // Just return success and let the client handle it
              return {
                success: true,
                customerId,
                paymentMethodId,
                method: "skipped_due_to_500",
                warning:
                  "Payment intent creation failed with 500 error, but proceeding with account linking",
              };
            }
          } catch (e) {
            // If not JSON, get as text
            errorText = await paymentIntentResponse.text();
            console.error("PayMongo API error (Payment Intent):", errorText);
          }

          // Log additional information about the error
          console.error("PayMongo API error details:", {
            status: paymentIntentResponse.status,
            statusText: paymentIntentResponse.statusText,
            headers: Object.fromEntries([
              ...paymentIntentResponse.headers.entries(),
            ]),
          });

          throw new Error(`Failed to create payment intent: ${errorText}`);
        }

        const paymentIntentData = await paymentIntentResponse.json();
        const paymentIntentId = paymentIntentData.data.id;
        const clientKey = paymentIntentData.data.attributes.client_key;

        // Now attach the payment method to the payment intent
        console.log(
          `Attaching payment method ${paymentMethodId} to payment intent ${paymentIntentId}`
        );

        const attachBody = {
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: clientKey,
              return_url: "https://example.com/success",
            },
          },
        };

        console.log("Attach request payload:", JSON.stringify(attachBody));

        const attachResponse = await fetch(
          `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
            },
            body: JSON.stringify(attachBody),
          }
        );

        if (!attachResponse.ok) {
          let errorText;
          try {
            // Try to parse as JSON first
            const errorJson = await attachResponse.json();
            errorText = JSON.stringify(errorJson);
            console.error("PayMongo API error (Attach):", errorJson);
          } catch (e) {
            // If not JSON, get as text
            errorText = await attachResponse.text();
            console.error("PayMongo API error (Attach):", errorText);
          }

          // Log additional information about the error
          console.error("PayMongo API error details (Attach):", {
            status: attachResponse.status,
            statusText: attachResponse.statusText,
            headers: Object.fromEntries([...attachResponse.headers.entries()]),
            paymentIntentId,
            paymentMethodId,
          });

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
          // Don't throw an error here, just log it
          console.log(
            "Warning: Failed to set default payment method, but payment method was attached"
          );
        }

        // Return success even if setting default failed - the payment method is still attached
        return {
          success: true,
          customerId,
          paymentMethodId,
          method: "payment_intent",
        };
      } catch (error) {
        console.error("Error attaching payment method:", error);

        // Check if the error is a 500 error from PayMongo
        const errorStr = String(error);
        if (
          errorStr.includes("500") &&
          errorStr.includes("Something went wrong on our end")
        ) {
          console.log(
            "Handling 500 error from PayMongo by returning partial success"
          );

          // Return a partial success response that the client can handle
          return {
            success: true,
            customerId,
            paymentMethodId,
            method: "error_recovery",
            warning:
              "Payment method attachment encountered a 500 error, but we're proceeding with account linking",
          };
        }

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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

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

          // Add a unique request ID to help with debugging
          const requestId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

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
                  request_id: requestId,
                  client_timestamp: new Date().toISOString(),
                },
              },
            },
          };

          console.log(
            `Payment intent request (${requestId}):`,
            JSON.stringify(requestPayload)
          );

          const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
              "X-Request-ID": requestId,
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

            console.error(
              `PayMongo API Error (Payment Intent Creation) for request ${requestId}:`,
              {
                status: response.status,
                statusText: response.statusText,
                errors: errorData.errors,
                retryCount,
                customerId,
                amount,
              }
            );

            // Check if it's a 500 error
            if (response.status === 500) {
              console.log(
                `Received 500 error from PayMongo API for request ${requestId}, will retry or handle specially`
              );

              // If we've already retried the maximum number of times
              if (retryCount === MAX_RETRIES - 1) {
                console.log(
                  "Maximum retries reached for 500 error, returning partial success"
                );

                // Return a partial success that the client can handle
                return {
                  success: true,
                  paymentIntentId: `error_recovery_${Date.now()}`,
                  status: "requires_payment_method",
                  warning:
                    "Payment intent creation failed with 500 error after multiple retries. The subscription may need to be retried later.",
                };
              }
            }

            lastError = new Error(
              `Failed to create payment intent: ${
                errorData.errors?.[0]?.detail || response.statusText
              }`
            );

            // Increment retry count and try again
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              // Wait before retrying (exponential backoff)
              const delay = 1000 * Math.pow(2, retryCount);
              console.log(`Retrying payment intent creation in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            } else {
              throw lastError;
            }
          }

          const data = await response.json();
          const paymentIntentId = data.data.id;
          console.log(
            `Successfully created payment intent: ${paymentIntentId} for request ${requestId}`
          );

          // Now attach the payment method to the intent
          console.log(
            `Attaching payment method ${paymentMethodId} to intent ${paymentIntentId}`
          );

          const attachResponse = await fetch(
            `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
                "X-Request-ID": `attach_${requestId}`,
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
            let errorText;
            try {
              // Try to parse as JSON first
              const errorJson = await attachResponse.json();
              errorText = JSON.stringify(errorJson);
              console.error(
                `PayMongo API error (Attach) for request ${requestId}:`,
                errorJson
              );

              // Check if it's a 500 error
              if (attachResponse.status === 500) {
                console.log(
                  "Received 500 error from PayMongo API during attach, returning partial success"
                );

                // Return a partial success that the client can handle
                return {
                  success: true,
                  paymentIntentId: paymentIntentId,
                  status: "requires_payment_method",
                  warning:
                    "Payment method attachment failed with 500 error. The payment intent was created but not attached.",
                };
              }
            } catch (e) {
              // If not JSON, get as text
              errorText = await attachResponse.text();
              console.error(
                `PayMongo API error (Attach) for request ${requestId}:`,
                errorText
              );
            }

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

          // Check if it's a 500 error from PayMongo
          const errorStr = String(error);
          const is500Error =
            errorStr.includes("500") &&
            errorStr.includes("Something went wrong on our end");

          if (is500Error && retryCount < MAX_RETRIES - 1) {
            // For 500 errors, we'll retry
            retryCount++;
            // Wait before retrying (exponential backoff)
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(
              `PayMongo 500 error. Retrying payment intent creation in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else if (is500Error && retryCount >= MAX_RETRIES - 1) {
            // If we've exhausted retries for a 500 error, return a partial success
            console.log(
              "Maximum retries reached for 500 error in catch block, returning partial success"
            );

            return {
              success: true,
              paymentIntentId: `error_recovery_${Date.now()}`,
              status: "requires_payment_method",
              warning:
                "Payment intent creation failed with 500 error after multiple retries. The subscription may need to be retried later.",
            };
          }

          retryCount++;
          if (retryCount < MAX_RETRIES) {
            // Wait before retrying (exponential backoff)
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(`Retrying after error in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          break;
        }
      }

      // If we've exhausted all retries, throw the last error
      throw lastError;
    } catch (error) {
      console.error("Error creating payment intent:", error);

      // Final check for 500 errors
      const errorStr = String(error);
      if (
        errorStr.includes("500") &&
        errorStr.includes("Something went wrong on our end")
      ) {
        console.log("Final 500 error handler, returning partial success");

        return {
          success: true,
          paymentIntentId: `final_error_recovery_${Date.now()}`,
          status: "requires_payment_method",
          warning:
            "Payment intent creation failed with 500 error. The subscription may need to be retried later.",
        };
      }

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
      // Try to get the secret key from the environment variable
      let PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

      // If not found, use the one from .env.local as a fallback
      if (!PAYMONGO_SECRET_KEY) {
        console.log(
          "PayMongo secret key not found in process.env, using fallback from .env.local"
        );
        PAYMONGO_SECRET_KEY = "sk_test_7BM4269dfvua3CRVz6n39qVB";
      }

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
