import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

export default function PaymentRedirect() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const isSuccess =
          params.status === "success" || params.success === "true";
        const deepLink = isSuccess
          ? "atletech://payment-callback?success=true"
          : "atletech://payment-callback?success=false";
        const canOpen = await Linking.canOpenURL(deepLink);

        if (canOpen) {
          await Linking.openURL(deepLink);
        } else {
          const route = isSuccess
            ? "/payment-callback?success=true"
            : "/payment-callback?success=false";

          router.replace(route);
        }
      } catch (error) {
        console.error("Error handling payment redirect:", error);
        router.replace("/payment-callback?success=false");
      }
    };
    handleRedirect();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.title}>Processing Payment</Text>
      <Text style={styles.message}>
        Please wait while we process your payment...
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
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.textPrimary,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.textSecondary,
  },
});
