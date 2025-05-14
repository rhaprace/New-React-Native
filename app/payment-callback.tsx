import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { COLORS } from "@/constants/theme";

export default function PaymentCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );

  useEffect(() => {
    const processPayment = async () => {
      try {
        const isSuccess =
          params.success === "true" || params.status === "success";

        if (isSuccess) {
          console.log("Processing successful payment");
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          const paymentId = "gcash_" + Date.now();

          await updateSubscription({
            subscription: "active",
            paymentDetails: {
              paymentIntentId: paymentId,
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
          // Redirect to profile page with a shorter timeout
          console.log("Payment successful, redirecting to profile page");
          setTimeout(() => router.replace("/(tabs)/profile"), 1000);
        } else {
          console.log("Payment was not successful");
          setTimeout(() => router.replace("/subscription/plans"), 2000);
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        setTimeout(() => router.replace("/subscription/plans"), 2000);
      }
    };

    processPayment();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Processing your payment...</Text>
      <Text style={styles.subtext}>
        Please wait while we verify your payment
      </Text>
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
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: COLORS.primary,
  },
  subtext: {
    fontSize: 14,
    marginTop: 10,
    color: COLORS.secondary,
    textAlign: "center",
  },
});
