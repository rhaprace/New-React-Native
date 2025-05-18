import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@/constants/theme";

export default function PaymentSuccess() {
  useEffect(() => {
    const redirectToApp = async () => {
      try {
        const canOpen = await Linking.canOpenURL(
          "atletech://payment-callback?success=true"
        );

        if (canOpen) {
          await Linking.openURL("atletech://payment-callback?success=true");
        } else {
          console.log(
            "Cannot open app URL, user may need to manually return to the app"
          );
        }
      } catch (error) {
        console.error("Error redirecting to app:", error);
      }
    };
    redirectToApp();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.title}>Payment Successful</Text>
      <Text style={styles.message}>
        Your payment has been processed successfully. You will be redirected
        back to the app.
      </Text>
      <Text style={styles.submessage}>
        If you are not redirected automatically, please return to the AtleTech
        app.
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
  submessage: {
    fontSize: 14,
    textAlign: "center",
    color: COLORS.textTertiary,
    marginTop: 10,
  },
});
