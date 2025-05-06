import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const PAYMONGO_SECRET_KEY = process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || "";
const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

const encodeBasicAuth = (key: string): string => {
  return btoa(key + ":");
};

const createPaymentIntent = async () => {
  const intentRes = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: 20000,
          payment_method_allowed: ["gcash", "paymaya"],
          payment_method_options: {
            card: { request_three_d_secure: "any" },
          },
          currency: "PHP",
        },
      },
    }),
  });

  if (!intentRes.ok) {
    const intentError = await intentRes.json();
    console.error("Create Intent Error:", intentError);
    throw new Error(
      intentError.errors?.[0]?.detail || "Failed to create payment intent"
    );
  }

  const intentData = await intentRes.json();
  return intentData.data;
};

const createPaymentSource = async () => {
  const sourceRes = await fetch(`${PAYMONGO_API_URL}/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodeBasicAuth(PAYMONGO_SECRET_KEY)}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: 20000,
          currency: "PHP",
          type: "gcash",
          redirect: {
            success: "https://example.com/success",
            failed: "https://example.com/failed",
          },
        },
      },
    }),
  });

  if (!sourceRes.ok) {
    const sourceError = await sourceRes.json();
    console.error("Create Source Error:", sourceError);
    throw new Error(
      sourceError.errors?.[0]?.detail || "Failed to create payment source"
    );
  }

  const sourceData = await sourceRes.json();
  return sourceData.data;
};

const attachPaymentMethod = async (
  intentId: string,
  paymentMethodId: string
) => {
  const returnUrl = "https://example.com/payment-callback";

  const methodRes = await fetch(
    `${PAYMONGO_API_URL}/payment_intents/${intentId}/attach`,
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
            return_url: returnUrl,
          },
        },
      }),
    }
  );

  if (!methodRes.ok) {
    const methodError = await methodRes.json();
    console.error("Attach Method Error:", methodError);
    throw new Error(
      methodError.errors?.[0]?.detail || "Failed to attach payment method"
    );
  }

  const methodData = await methodRes.json();
  return methodData.data;
};

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  const savePaymentSource = useMutation(api.subscription.savePaymentSource);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const source = await createPaymentSource();
      console.log("Payment Source:", source);

      await savePaymentSource({ sourceId: source.id });

      const checkoutUrl = source.attributes.redirect.checkout_url;
      if (!checkoutUrl) {
        throw new Error("No checkout URL found");
      }

      Linking.addEventListener("url", handleDeepLink);

      if (await Linking.canOpenURL(checkoutUrl)) {
        await Linking.openURL(checkoutUrl);

        Alert.alert(
          "Payment Instructions",
          "Complete your payment in GCash. After payment, return to this app to check your subscription status.",
          [
            {
              text: "Check Payment Status",
              onPress: () => router.replace("/subscription/subscription"),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Cannot open GCash payment page");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Payment failed"
      );
      setLoading(false);
    }
  };

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log("Received deep link:", url);

    Linking.removeAllListeners("url");

    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      if (url.includes("success") || params.get("success") === "true") {
        await processSuccessfulPayment();
      } else {
        Alert.alert(
          "Payment Failed",
          "Your payment was not completed. Please try again."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error handling deep link:", error);
      Alert.alert("Error", "There was a problem processing your payment.");
      setLoading(false);
    }
  };
  const processSuccessfulPayment = async () => {
    try {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await updateSubscription({
        subscription: "active",
        paymentDetails: {
          paymentIntentId: "gcash_" + Date.now(),
          paymentMethod: "gcash",
          amount: 20000,
          currency: "PHP",
          status: "completed",
          lastPaymentDate: new Date().toISOString(),
          nextBillingDate: nextBillingDate.toISOString(),
          subscriptionEndDate: nextBillingDate.toISOString(),
        },
      });
      await updatePromptSeen();

      Alert.alert("Payment Successful", "Thank you for your subscription!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      console.error("Error processing successful payment:", error);
      Alert.alert(
        "Error",
        "Your payment was received, but there was an issue updating your subscription. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Payment Method</Text>
      <Text style={styles.amount}>Amount: ₱200.00</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Processing..." : "Pay with GCash"}
          onPress={handlePayment}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  amount: {
    fontSize: 18,
    marginBottom: 30,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    marginTop: 20,
  },
});
