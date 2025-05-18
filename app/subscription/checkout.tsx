import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Linking,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { COLORS } from "@/constants/theme";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import ThankYouModal from "@/components/subscription/ThankYouModal";
import styles from "@/styles/checkout.styles";
import { useToast } from "../../hooks/useToast";
import {
  createPaymentSource,
  checkPaymentStatus,
} from "@/services/paymentService";

export default function Checkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("gcash");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "init" | "processing" | "confirming" | "success" | "failed"
  >("init");
  const toast = useToast();
  const planName = (params.planName as string) || "Monthly";
  const planPrice = parseInt((params.planPrice as string) || "7500");
  const planDescription =
    (params.planDescription as string) || "Standard monthly subscription";
  const isDiscounted = (params.isDiscounted as string) === "true";
  const originalPrice = parseInt((params.originalPrice as string) || "20000");
  const isPlanChange = (params.isPlanChange as string) === "true";
  const currentPlanRemaining = parseInt(
    (params.currentPlanRemaining as string) || "0"
  );

  const updateSubscription = useMutation(api.subscription.updateSubscription);
  const updatePromptSeen = useMutation(
    api.subscription.updateSubscriptionPromptSeen
  );
  const savePaymentSource = useMutation(api.subscription.savePaymentSource);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentStep("processing");
      toast.show({
        type: "info",
        message: "Initiating payment process...",
      });

      const source = await createPaymentSource(
        selectedPaymentMethod,
        planPrice
      );
      console.log("Payment Source:", source);

      await savePaymentSource({ sourceId: source.id });

      const checkoutUrl = source.attributes.redirect.checkout_url;
      if (!checkoutUrl) {
        throw new Error("No checkout URL found");
      }

      Linking.addEventListener("url", handleDeepLink);

      if (await Linking.canOpenURL(checkoutUrl)) {
        setPaymentStep("confirming");
        toast.show({
          type: "info",
          message: "Redirecting to payment gateway...",
        });
        await Linking.openURL(checkoutUrl);
        Alert.alert(
          "Payment Instructions",
          `Complete your payment in ${selectedPaymentMethod === "gcash" ? "GCash" : "PayMaya"}. After payment, return to this app to check your subscription status.`,
          [
            {
              text: "Check Payment Status",
              onPress: () => {
                setPaymentStep("confirming");
                checkPaymentAndUpdate(source.id);
              },
            },
            {
              text: "Need Help?",
              onPress: () => {
                Alert.alert(
                  "Support",
                  "If you're having trouble with your payment, please contact our support team at support@example.com or call +63 XXX XXX XXXX",
                  [
                    { text: "OK" },
                    {
                      text: "Email Support",
                      onPress: () =>
                        Linking.openURL("mailto:support@example.com"),
                    },
                  ]
                );
              },
            },
          ]
        );
      } else {
        setPaymentStep("failed");
        toast.show({
          type: "error",
          message: "Could not open payment gateway",
        });
        Alert.alert(
          "Error",
          `Cannot open ${selectedPaymentMethod === "gcash" ? "GCash" : "PayMaya"} payment page`
        );
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setPaymentStep("failed");
      toast.show({
        type: "error",
        message: error instanceof Error ? error.message : "Payment failed",
      });
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentAndUpdate = async (sourceId: string) => {
    try {
      setLoading(true);
      let isPaymentSuccessful = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts && !isPaymentSuccessful) {
        const status = await checkPaymentStatus(sourceId);
        isPaymentSuccessful =
          status === true || status === "chargeable" || status === "paid";
        if (isPaymentSuccessful) {
          setPaymentStep("success");
          await processSuccessfulPayment();
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (!isPaymentSuccessful) {
        setPaymentStep("failed");
        Alert.alert(
          "Payment Pending",
          "Your payment is still being processed. Please wait a moment and try checking again.",
          [
            {
              text: "Check Again",
              onPress: () => checkPaymentAndUpdate(sourceId),
            },
            {
              text: "Go to Profile",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      setPaymentStep("failed");
      Alert.alert(
        "Error",
        "Failed to check payment status. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log("Received deep link:", url);
    Linking.removeAllListeners("url");

    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      const sourceId = params.get("source_id");

      if (!sourceId) {
        throw new Error("No source ID found in URL");
      }

      await checkPaymentAndUpdate(sourceId);
    } catch (error) {
      console.error("Error handling deep link:", error);
      Alert.alert("Error", "There was a problem processing your payment.");
      setPaymentStep("failed");
      setLoading(false);
    }
  };

  const processSuccessfulPayment = async () => {
    try {
      setPaymentStep("success");
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await updateSubscription({
        subscription: "active",
        paymentDetails: {
          paymentIntentId: `${selectedPaymentMethod}_${Date.now()}`,
          paymentMethod:
            selectedPaymentMethod === "gcash" ? "gcash" : "paymaya",
          amount: planPrice,
          currency: "PHP",
          status: "completed",
          lastPaymentDate: new Date().toISOString(),
          nextBillingDate: nextBillingDate.toISOString(),
          subscriptionEndDate: nextBillingDate.toISOString(),
        },
      });
      await updatePromptSeen();
      Alert.alert(
        "Payment Successful",
        "Your subscription has been activated successfully! You will receive a confirmation email shortly.",
        [
          {
            text: "View Receipt",
            onPress: () => {
              Alert.alert(
                "Receipt",
                `Payment Details:\nAmount: ${formatPrice(planPrice)}\nDate: ${new Date().toLocaleDateString()}\nTransaction ID: ${selectedPaymentMethod}_${Date.now()}\n\nA copy has been sent to your email.`
              );
            },
          },
          {
            text: "Continue",
            onPress: () => {
              setShowThankYouModal(true);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error processing successful payment:", error);
      setPaymentStep("failed");
      toast.show({
        type: "error",
        message: "Failed to update subscription",
      });
      Alert.alert(
        "Error",
        "Your payment was received, but there was an issue updating your subscription. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(2)}`;
  };

  useEffect(() => {
    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/subscription/plans")}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Checkout</Text>
            <View style={styles.placeholder} />
          </View>
          {paymentStep !== "init" && (
            <View style={styles.statusContainer}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.statusIndicator}
              />
              <Text style={styles.statusText}>
                {paymentStep === "processing" && "Processing payment..."}
                {paymentStep === "confirming" && "Confirming payment..."}
                {paymentStep === "success" && "Payment successful!"}
                {paymentStep === "failed" && "Payment failed"}
              </Text>
            </View>
          )}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View style={styles.planContainer}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{planName}</Text>
                <Text style={styles.planDescription}>{planDescription}</Text>
              </View>
              <View style={styles.priceContainer}>
                {isDiscounted && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(originalPrice)}
                  </Text>
                )}
                <Text style={styles.price}>{formatPrice(planPrice)}</Text>
              </View>
            </View>

            {isPlanChange && (
              <>
                <View style={styles.divider} />
                <View style={styles.planChangeDetails}>
                  <Text style={styles.planChangeTitle}>
                    Plan Change Details
                  </Text>
                  <Text style={styles.planChangeText}>
                    Current Plan Remaining: {formatPrice(currentPlanRemaining)}
                  </Text>
                  <Text style={styles.planChangeText}>
                    New Plan Cost: {formatPrice(planPrice)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatPrice(planPrice)}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === "gcash" &&
                  styles.selectedPaymentOption,
              ]}
              onPress={() => setSelectedPaymentMethod("gcash")}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radioButtonContainer}>
                  {selectedPaymentMethod === "gcash" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <View style={styles.paymentLogoContainer}>
                  <Image
                    source={{
                      uri: "https://www.gcash.com/wp-content/uploads/2019/04/gcash-logo.png",
                    }}
                    style={styles.paymentLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.paymentName}>GCash</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === "paymaya" &&
                  styles.selectedPaymentOption,
              ]}
              onPress={() => setSelectedPaymentMethod("paymaya")}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radioButtonContainer}>
                  {selectedPaymentMethod === "paymaya" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <View style={styles.paymentLogoContainer}>
                  <Image
                    source={{
                      uri: "https://www.maya.ph/hubfs/Maya%20Brand%20Assets/Maya%20Logo/RGB/Maya_Logo_RGB_Green.png",
                    }}
                    style={styles.paymentLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.paymentName}>Maya (PayMaya)</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              fullWidth
              onPress={handlePayment}
            >
              {loading
                ? "Processing..."
                : `Pay with ${selectedPaymentMethod === "gcash" ? "GCash" : "Maya"}`}
            </Button>
          </View>
          <View style={styles.securitySection}>
            <View style={styles.securityItem}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.securityText}>Secure Payment</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
              <Text style={styles.securityText}>Data Protected</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={styles.securityText}>30-Day Refund</Text>
            </View>
          </View>
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              <Text>By proceeding, you agree to our </Text>
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://example.com/terms")}
              >
                Terms of Service
              </Text>
              <Text> and </Text>
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://example.com/privacy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      <ThankYouModal
        visible={showThankYouModal}
        onClose={() => {
          setShowThankYouModal(false);
          router.replace("/(tabs)");
        }}
        isTrialActivation={false}
      />
    </SafeAreaView>
  );
}
