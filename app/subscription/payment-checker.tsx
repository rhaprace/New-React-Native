import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

const checkPaymentStatus = async (sourceId: string) => {
  try {
    const PAYMONGO_SECRET_KEY =
      process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || "";
    const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
    const encodeBasicAuth = (key: string) => {
      return btoa(`${key}:`);
    };

    console.log("Checking payment status for source:", sourceId);

    // Fetch the source from PayMongo
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
    console.log("Payment status response:", JSON.stringify(data));

    const status = data.data.attributes.status;
    console.log("Payment status:", status);
    return status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return "error";
  }
};

export default function PaymentChecker() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const { isAuthenticated } = useConvexAuth();

  // Only fetch payment source if user is authenticated
  const paymentSource = useQuery(api.subscription.checkPaymentSource);

  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );

  useEffect(() => {
    // Only proceed if the user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check if paymentSource exists and has a sourceId
    if (paymentSource && paymentSource.sourceId && !checking && !status) {
      checkPendingPayment();
    }

    const intervalId = setInterval(() => {
      // Check if user is still authenticated and paymentSource exists before making API calls
      if (
        isAuthenticated &&
        paymentSource &&
        paymentSource.sourceId &&
        !checking &&
        (status === "pending" || !status)
      ) {
        checkPendingPayment();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [paymentSource, status, isAuthenticated]);

  const checkPendingPayment = async () => {
    // Check if user is authenticated and payment source exists
    if (!isAuthenticated || !paymentSource || !paymentSource.sourceId) return;

    setChecking(true);

    try {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (
        paymentSource.timestamp &&
        paymentSource.timestamp < thirtyMinutesAgo
      ) {
        setStatus("expired");
        return;
      }
      const paymentStatus = await checkPaymentStatus(paymentSource.sourceId);
      setStatus(paymentStatus);

      if (
        paymentStatus === "chargeable" ||
        paymentStatus === "paid" ||
        paymentStatus === "completed"
      ) {
        await processSuccessfulPayment();
      }
    } catch (error) {
      console.error("Error checking pending payment:", error);
      setStatus("error");
    } finally {
      setChecking(false);
    }
  };

  const processSuccessfulPayment = async () => {
    // Check if user is authenticated and payment source exists before processing payment
    if (!isAuthenticated || !paymentSource) {
      console.log(
        "User is not authenticated or payment source is missing, cannot process payment"
      );
      return;
    }

    try {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      await updateSubscription({
        subscription: "active",
        paymentDetails: {
          paymentIntentId: paymentSource.sourceId || "gcash_" + Date.now(),
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

      // Redirect to profile page for new users
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Error processing payment:", error);
      // Set status to error so user can try again
      setStatus("error");
    }
  };

  // Don't show anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't show anything if there's no payment source to check
  if (!paymentSource || !paymentSource.sourceId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Status</Text>

      {checking ? (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.message}>Checking your payment status...</Text>
        </>
      ) : (
        <>
          {status === "pending" && (
            <>
              <Text style={styles.message}>
                Your payment is being processed.
              </Text>
              <Button title="Check Again" onPress={checkPendingPayment} />
            </>
          )}

          {status === "paid" ||
          status === "chargeable" ||
          status === "completed" ? (
            <>
              <Text style={styles.successMessage}>Payment successful!</Text>
              <Text style={styles.message}>
                Your subscription is now active.
              </Text>
              <Button
                title="Continue"
                onPress={() => router.replace("/(tabs)/profile")}
              />
            </>
          ) : null}

          {status === "failed" && (
            <>
              <Text style={styles.errorMessage}>Payment failed</Text>
              <Text style={styles.message}>
                Please try again with a different payment method.
              </Text>
              <Button
                title="Try Again"
                onPress={() => router.replace("/subscription/checkout")}
              />
            </>
          )}

          {status === "expired" && (
            <>
              <Text style={styles.errorMessage}>Payment session expired</Text>
              <Text style={styles.message}>
                Your payment session has expired. Please try again.
              </Text>
              <Button
                title="Try Again"
                onPress={() => router.replace("/subscription/checkout")}
              />
            </>
          )}

          {status === "error" && (
            <>
              <Text style={styles.errorMessage}>Error checking payment</Text>
              <Text style={styles.message}>
                There was an error checking your payment status.
              </Text>
              <Button title="Try Again" onPress={checkPendingPayment} />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: COLORS.primary,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    color: "#555",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginTop: 10,
  },
});
