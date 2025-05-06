import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Gate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useUser();
  const userSubscription = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!userSubscription || userSubscription.subscription !== "active") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.message}>
          You need an active subscription to access this feature.
        </Text>
        <Button
          title="Subscribe Now"
          onPress={() => router.push("../subscription/subscription")}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f6f9f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});
