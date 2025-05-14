import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "@/components/ui/BaseModal";
import Button from "@/components/ui/Button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface GCashLinkModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showPromoDetails?: boolean;
}

const GCashLinkModal: React.FC<GCashLinkModalProps> = ({
  visible,
  onClose,
  onSuccess,
  showPromoDetails = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  // Use the saveGCashNumber mutation to store the phone number
  const saveGCashNumber = useMutation(api.subscription.saveGCashNumber);

  const handleSendVerification = () => {
    // Validate phone number
    if (
      !phoneNumber ||
      phoneNumber.length !== 11 ||
      !phoneNumber.startsWith("09")
    ) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 11-digit Philippine mobile number starting with 09."
      );
      return;
    }

    setLoading(true);

    // Simulate sending verification code
    setTimeout(() => {
      setLoading(false);
      setShowVerification(true);
      // In a real app, this would send an actual SMS
      Alert.alert(
        "Verification Code Sent",
        "We've sent a verification code to your phone number."
      );
    }, 1500);
  };

  const handleVerifyAndLink = async () => {
    // Validate verification code
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would verify the code with an API
      // For this mockup, we'll just simulate success after a delay
      setTimeout(async () => {
        try {
          // Save GCash number and extend trial
          await saveGCashNumber({ phoneNumber });

          setLoading(false);
          Alert.alert(
            "GCash Account Linked",
            "Your GCash account has been successfully linked and your free trial has been extended.",
            [{ text: "Continue", onPress: onSuccess }]
          );
        } catch (error) {
          setLoading(false);
          Alert.alert(
            "Error",
            "There was an error linking your account. Please try again."
          );
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Error",
        "There was an error verifying your code. Please try again."
      );
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    // Only allow digits and limit to 11 characters
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
    }
  };

  const handleVerificationCodeChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 6) {
      setVerificationCode(cleaned);
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Link Your GCash Account"
      showCloseIcon={true}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* GCash Logo */}
          <Image
            source={{
              uri: "https://www.gcash.com/wp-content/uploads/2019/04/gcash-logo.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Description */}
          <Text style={styles.description}>
            {showPromoDetails
              ? "Link your GCash account now to secure our special promo rate of ₱75/month for your first 3 months after the trial. After the promo period, your subscription will continue at ₱200/month."
              : "Link your GCash account for easy and secure payments. Your account will only be charged after your free trial ends."}
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.benefitText}>Secure payment processing</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.benefitText}>
                Automatic subscription renewal
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.benefitText}>
                Cancel or change plans anytime
              </Text>
            </View>
            {showPromoDetails && (
              <View style={styles.benefitRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.benefitText}>
                  Special 3-month promo rate
                </Text>
              </View>
            )}
          </View>

          {/* Promo Details */}
          {showPromoDetails && (
            <View style={styles.promoContainer}>
              <Text style={styles.promoTitle}>Special Promo Rate:</Text>
              <Text style={styles.promoPrice}>₱75.00/month</Text>
              <Text style={styles.promoDuration}>for your first 3 months</Text>
              <Text style={styles.promoRegular}>then ₱200.00/month after</Text>
            </View>
          )}

          {/* Link Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onSuccess}
            style={styles.linkButton}
          >
            Link GCash Account
          </Button>

          {/* Terms */}
          <Text style={styles.terms}>
            By linking your account, you agree to our{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://example.com/terms")}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://example.com/privacy")}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  logo: {
    width: 120,
    height: 40,
  },
  description: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  phonePrefix: {
    backgroundColor: COLORS.slate_100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textPrimary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    textAlign: "center",
    letterSpacing: 2,
  },
  inputHint: {
    fontSize: FONT.size.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  resendText: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  securityText: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    textAlign: "center",
    flex: 1,
  },
  benefitsContainer: {
    marginBottom: SPACING.lg,
  },
  benefitsTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  promoContainer: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    alignItems: "center",
  },
  promoTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  promoPrice: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
  promoDuration: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  promoRegular: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  linkButton: {
    marginBottom: SPACING.lg,
  },
  terms: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  scrollView: {
    flex: 1,
  },
});

export default GCashLinkModal;
