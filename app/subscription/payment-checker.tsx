import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from "react-native";
import { useQuery, useMutation, useConvexAuth, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { checkPaymentStatus } from "@/services/paymentServiceClient";

export default function PaymentChecker() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const { isAuthenticated } = useConvexAuth();
  const [checkTimeout, setCheckTimeout] = useState<number | null>(null);
  const paymentSource = useQuery(api.subscription.checkPaymentSource);

  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  // Get the Convex client
  const convex = useConvex();
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (!paymentSource || !paymentSource.sourceId) {
      return;
    }

    // Increase timeout to 60 seconds to allow for PayMongo server issues
    const timeout = setTimeout(() => {
      console.log(
        "Auth check timed out its working but in the api we have a problem identify when it causing it"
      );

      // Instead of immediately redirecting, show a message to the user
      setStatus("timeout");

      // Still redirect after a short delay to allow user to read the message
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 5000);
    }, 60000);

    setCheckTimeout(timeout);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAuthenticated, paymentSource]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null);
      return;
    }
    if (paymentSource && paymentSource.sourceId && !checking && !status) {
      checkPendingPayment();
    }

    const intervalId = setInterval(() => {
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

    return () => {
      clearInterval(intervalId);
      setStatus(null);
    };
  }, [paymentSource, status, isAuthenticated]);

  const checkPendingPayment = async () => {
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
      // Use the Convex client from the top level
      const paymentStatus = await checkPaymentStatus(
        convex,
        paymentSource.sourceId
      );
      setStatus(paymentStatus);

      const isSuccessful =
        paymentStatus === "chargeable" ||
        paymentStatus === "paid" ||
        paymentStatus === "completed";

      if (isSuccessful) {
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
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Error processing payment:", error);
      setStatus("error");
    }
  };
  if (!isAuthenticated) {
    return null;
  }
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

          {status === "timeout" && (
            <>
              <Text style={styles.errorMessage}>
                Payment service temporarily unavailable
              </Text>
              <Text style={styles.message}>
                The payment service is experiencing technical difficulties. Your
                payment may still be processing. Please check your account
                status later.
              </Text>
              <Button
                title="Continue to App"
                onPress={() => router.replace("/(tabs)")}
              />
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
