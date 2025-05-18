import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
declare global {
  var hasOTPBeenSentForUser: Record<string, boolean>;
}
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COLORS, FONT, RADIUS, SPACING } from "@/constants/theme";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import OTPInput from "@/components/auth/OTPInput";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: SPACING.xl,
  },
  otpContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  otpHint: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  verifyButton: {
    width: "100%",
    marginBottom: SPACING.lg,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  resendText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  resendButton: {
    minHeight: 0,
    padding: 0,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
});

export default function VerifyEmail() {
  const { user } = useUser();
  const router = useRouter();
  const sendOTP = useAction(api.users.sendEmailOTP);
  const verifyOTP = useMutation(api.users.verifyEmailOTP);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const hasInitializedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendOTP = useCallback(
    async (isResend: boolean = false) => {
      console.log("Sending OTP for user:", {
        userId: user?.id,
        isResend,
        resendDisabled,
      });
      if (!user || resendDisabled) return;

      try {
        setLoading(true);
        const result = await sendOTP({ clerkId: user.id });
        console.log("OTP send result:", result);

        if (result.success) {
          if (isResend) {
            setResendDisabled(true);
            setCountdown(60);
            Alert.alert(
              "Verification Code Sent",
              "A new verification code has been sent to your email. Please check your inbox and spam folder."
            );
          }
        } else {
          const errorMessage =
            result.message || "Failed to send verification code.";
          console.error("Failed to send OTP:", errorMessage, result.details);

          Alert.alert("Verification Code Error", errorMessage, [
            {
              text: "Try Again",
              onPress: () => {
                if (isResend) {
                  setResendDisabled(false);
                  setCountdown(0);
                }
              },
            },
          ]);
        }
      } catch (error: any) {
        console.error("Error sending OTP:", error);

        const errorMessage =
          error.message ||
          "Failed to send verification code. Please try again.";

        Alert.alert("Error", errorMessage, [
          {
            text: "Try Again",
            onPress: () => {
              if (isResend) {
                setResendDisabled(false);
                setCountdown(0);
              }
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [user, resendDisabled, sendOTP]
  );

  const handleResendOTP = useCallback(() => {
    handleSendOTP(true);
  }, [handleSendOTP]);
  const handleVerifyOTP = useCallback(async () => {
    console.log("Verifying OTP:", { otp, length: otp.length });
    if (!user || !otp || otp.length !== 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the 6-digit verification code sent to your email."
      );
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP({
        clerkId: user.id,
        otp,
      });

      console.log("OTP verification result:", result);

      if (result.verified) {
        Alert.alert(
          "Verification Successful",
          "Your email has been verified successfully!",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/subscription/plans"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          "The verification code is invalid or has expired. Please try again or request a new code.",
          [
            {
              text: "Try Again",
              onPress: () => setOtp(""),
            },
            {
              text: "Request New Code",
              onPress: () => {
                setOtp("");
                handleResendOTP();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let errorMessage = "Please try again.";

      if (error.message) {
        if (error.message.includes("expired")) {
          errorMessage =
            "Your verification code has expired. Please request a new code.";
        } else if (error.message.includes("Invalid")) {
          errorMessage =
            "The verification code you entered is incorrect. Please check and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Verification Failed", errorMessage, [
        {
          text: "Try Again",
          onPress: () => setOtp(""),
        },
        {
          text: "Request New Code",
          onPress: () => {
            setOtp("");
            handleResendOTP();
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, otp, verifyOTP, router, handleResendOTP]);
  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    if (!global.hasOTPBeenSentForUser) {
      global.hasOTPBeenSentForUser = {};
    }
    const userKey = user.id || "unknown";
    if (!hasInitializedRef.current && !global.hasOTPBeenSentForUser[userKey]) {
      console.log("Initializing first-time OTP send for user:", userKey);
      hasInitializedRef.current = true;
      global.hasOTPBeenSentForUser[userKey] = true;
      const timer = setTimeout(() => {
        handleSendOTP(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log("Skipping OTP send - already initialized for user:", userKey);
    }
  }, [user, router, handleSendOTP]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.header}>
            <Ionicons name="mail-unread" size={40} color={COLORS.primary} />
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to your email
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.otpContainer}>
              <OTPInput length={6} value={otp} onChange={setOtp} />
              <Text style={styles.otpHint}>
                Enter 6-digit verification code
              </Text>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              loading={loading}
              style={styles.verifyButton}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            {!loading && (
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <Button
                  variant="text"
                  onPress={handleResendOTP}
                  disabled={resendDisabled}
                  style={styles.resendButton}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
                </Button>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                Check your spam/junk folder if you don't see the email in your
                inbox "Your Atle Verification Code".
              </Text>
            </View>

            <View style={[styles.infoContainer, { marginTop: SPACING.md }]}>
              <Ionicons
                name="help-circle"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                If you're still not receiving the verification code, please try
                the following:
                {"\n\n"}• Check your email address is correct
                {"\n"}• Check your internet connection
                {"\n"}• Add rhaprace@gmail.com to your contacts
                {"\n"}• Check your email spam filters
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
