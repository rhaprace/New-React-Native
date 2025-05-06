import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";
import PaymentChecker from "./payment-checker";

export default function Subscription() {
  const router = useRouter();
  const startTrial = useMutation(api.subscription.startFreeTrial);
  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  const [loading, setLoading] = useState(false);

  const handleFreeTrial = async () => {
    setLoading(true);
    try {
      const response = await startTrial();

      await updatePromptSeen();

      if (response.success) {
        router.replace("../(tabs)/profile");
      } else {
        Alert.alert("Error", "Failed to start free trial. Please try again.");
      }
    } catch (error) {
      console.error("Error starting free trial:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("already used your free trial")) {
        Alert.alert(
          "Free Trial Used",
          "You've already used your free trial. Please choose a subscription plan.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "There was an error starting your free trial.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await updateSubscription({ subscription: "active" });
      await updatePromptSeen();
      router.replace("./checkout");
    } catch (error) {
      console.error("Error subscribing:", error);
      Alert.alert("Error", "There was an error subscribing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PaymentChecker />

      <Text style={styles.heading}>Choose Your Plan</Text>
      <Text style={styles.subheading}>
        Start your fitness journey with AthleTech!
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          onPress={handleFreeTrial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>Start Free Trial (7 days)</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.secondary }]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 40,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.surface,
    fontWeight: "bold",
  },
});
