import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/atle-webhooks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.ATLE_WEBHOOK;
    if (!webhookSecret) {
      console.error("Missing webhook secret environment variable");
      return new Response("Missing webhook secret", { status: 400 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.error("Missing Svix headers");
      return new Response("Missing Svix headers", { status: 400 });
    }

    const payload = await request.json();

    // Use the payload directly as the event
    const evt: any = payload;

    // Log the event for debugging
    console.log("Webhook received:", JSON.stringify(evt));

    // Check if evt is defined and has a type property
    if (evt && evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      // Check if user already exists before creating
      try {
        // First check if user already exists
        const existingUser = await ctx.runQuery(api.users.getUserByClerkId, {
          clerkId: id,
        });

        // Only create if user doesn't exist
        if (!existingUser) {
          const email = email_addresses[0].email_address;
          const name = `${first_name || ""} ${last_name || ""}`.trim();

          console.log(`Webhook: Creating new user with clerkId ${id}`);

          await ctx.runMutation(api.users.createUser, {
            email,
            fullname: name,
            image: image_url || undefined,
            clerkId: id,
            username: email.split("@")[0],
          });

          console.log(`Webhook: Successfully created user for clerkId ${id}`);
        } else {
          console.log(
            `Webhook: User with clerkId ${id} already exists, skipping creation`
          );
        }
      } catch (error) {
        console.error("Error in user.created webhook:", error);
        return new Response("Error processing user creation", { status: 500 });
      }
    }
    if (evt && evt.type === "payment.completed") {
      const { id, amount, currency, status } = evt.data;

      try {
        const paymentAmount =
          typeof amount === "number" ? amount : parseFloat(amount);
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        // Use the updateSubscription mutation which now properly clears trial dates
        await ctx.runMutation(api.subscription.updateSubscription, {
          subscription: "active",
          paymentDetails: {
            paymentIntentId: id,
            paymentMethod: "gcash",
            lastPaymentDate: new Date().toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            subscriptionEndDate: nextBillingDate.toISOString(),
            amount: paymentAmount,
            currency: typeof currency === "string" ? currency : "PHP",
            status: status === "succeeded" ? "completed" : "failed",
          },
        });
        console.log(
          `Payment completed for user with ID: ${id}, amount: ${paymentAmount} ${currency}`
        );
      } catch (error) {
        console.error("Error processing payment:", error);
        return new Response("Error processing payment", { status: 500 });
      }
    }

    // If we've processed the event or if it's an event type we don't handle,
    // return a success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// Add a route for PayMongo webhooks
http.route({
  path: "/paymongo-webhooks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing PayMongo webhook secret environment variable");
      return new Response("Missing webhook secret", { status: 400 });
    }

    // Verify PayMongo webhook signature
    const paymongoSignature = request.headers.get("paymongo-signature");
    if (!paymongoSignature) {
      console.error("Missing PayMongo signature header");
      return new Response("Missing signature header", { status: 400 });
    }

    try {
      // Parse the webhook payload
      const payload = await request.json();
      console.log("PayMongo webhook received:", JSON.stringify(payload));

      // Handle different event types
      const eventType = payload.data?.attributes?.type;
      const eventData = payload.data?.attributes?.data;

      if (eventType === "payment.paid" && eventData) {
        // Extract payment intent ID and customer ID
        const paymentIntentId = eventData.id;
        const customerId = eventData.attributes?.metadata?.customer_id;
        const amount = eventData.attributes?.amount;
        const currency = eventData.attributes?.currency;

        if (paymentIntentId && customerId) {
          // Process the payment success
          await ctx.runAction(
            internal.subscriptionRenewal.processWebhookPaymentSuccess,
            {
              paymongoCustomerId: customerId,
              paymentIntentId: paymentIntentId,
              amount: amount || 0,
              currency: currency || "PHP",
            }
          );
        }
      } else if (eventType === "payment.failed" && eventData) {
        // Extract payment intent ID and customer ID
        const paymentIntentId = eventData.id;
        const customerId = eventData.attributes?.metadata?.customer_id;

        if (paymentIntentId && customerId) {
          // Process the payment failure
          await ctx.runAction(
            internal.subscriptionRenewal.processWebhookPaymentFailure,
            {
              paymongoCustomerId: customerId,
              paymentIntentId: paymentIntentId,
            }
          );
        }
      }

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: "PayMongo webhook processed successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error processing PayMongo webhook:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error processing webhook",
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
