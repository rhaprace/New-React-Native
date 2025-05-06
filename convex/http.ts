import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

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
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook", err);
      return new Response("Error verifying webhook", { status: 400 });
    }

    if (evt.type === "user.created") {
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
    if (evt.type === "payment.completed") {
      const { id, amount, currency, status } = evt.data;

      try {
        const paymentAmount =
          typeof amount === "number" ? amount : parseFloat(amount);
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

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

    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
