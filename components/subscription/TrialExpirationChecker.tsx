import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import DiscountModal from "./DiscountModal";
import GCashLinkModal from "./GCashLinkModal";
import { Alert } from "react-native";

const TrialExpirationChecker: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  // Get user subscription data
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const savePaymentMethod = useMutation(
    api.subscription.saveTrialPaymentMethod
  );

  // Check if trial is about to expire
  useEffect(() => {
    // Make sure userData is loaded and component is mounted
    if (!userData) return;

    // Add a small delay to ensure the app is fully mounted
    const timer = setTimeout(() => {
      if (userData.subscription === "free_trial" && userData.trialEndDate) {
        const trialEnd = new Date(userData.trialEndDate);
        const now = new Date();

        // Calculate days left in trial
        const timeDiff = trialEnd.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        setDaysLeft(daysRemaining);

        // If payment method not entered and more than 5 days left, show GCash modal
        if (!userData.paymentMethodEntered && daysRemaining > 5) {
          setShowGCashModal(true);
        }
        // If payment method not entered and 5 or fewer days left, show discount modal
        else if (
          !userData.paymentMethodEntered &&
          daysRemaining <= 5 &&
          daysRemaining > 0
        ) {
          setShowDiscountModal(true);
        }
        // If payment method entered and 5 or fewer days left, show reminder about auto-renewal
        else if (
          userData.paymentMethodEntered &&
          daysRemaining <= 5 &&
          daysRemaining > 0
        ) {
          Alert.alert(
            "Trial Ending Soon",
            `Your trial will end in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}. Your subscription will automatically continue at ₱75/month for 3 months, then ₱200/month after that.`,
            [
              {
                text: "Change Payment Method",
                onPress: () => setShowGCashModal(true),
              },
              {
                text: "OK",
                style: "default",
              },
            ]
          );
        }
      }
    }, 500); // Small delay to ensure app is mounted

    return () => clearTimeout(timer);
  }, [userData]);

  // Handle selecting monthly plan
  const handleSelectMonthlyPlan = () => {
    setShowDiscountModal(false);
    setShowGCashModal(true);
  };

  // Handle selecting yearly plan
  const handleSelectYearlyPlan = () => {
    setShowDiscountModal(false);
    setShowGCashModal(true);
  };

  // Handle selecting free trial with GCash linking
  const handleSelectFreeTrial = () => {
    setShowDiscountModal(false);
    setShowGCashModal(true);
  };

  // Handle successful GCash linking
  const handleGCashLinkSuccess = async () => {
    try {
      await savePaymentMethod({ paymentMethod: "gcash" });
      setShowGCashModal(false);

      Alert.alert(
        "Payment Method Saved",
        "Your payment method has been saved. After your trial ends, you'll be automatically subscribed at ₱75/month for 3 months, then ₱200/month after that.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving payment method:", error);
      Alert.alert(
        "Error",
        "There was an error saving your payment method. Please try again."
      );
    }
  };

  return (
    <>
      {/* Discount Modal */}
      <DiscountModal
        visible={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onSelectMonthlyPlan={handleSelectMonthlyPlan}
        onSelectYearlyPlan={handleSelectYearlyPlan}
        onSelectFreeTrial={handleSelectFreeTrial}
        daysLeft={daysLeft}
        showPromoOffer={true}
      />

      {/* GCash Link Modal */}
      <GCashLinkModal
        visible={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onSuccess={handleGCashLinkSuccess}
        showPromoDetails={true}
      />
    </>
  );
};

export default TrialExpirationChecker;
