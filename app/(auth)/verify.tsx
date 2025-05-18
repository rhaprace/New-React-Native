import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { localStyles } from "@/styles/verify.styles";
import OTPInput from "@/components/auth/OTPInput";

export default function Verify() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { signIn, setActive } = useSignIn();

  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );
  const [seconds, setSeconds] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  useEffect(() => {
    // Initialize the timer for resend OTP
    if (seconds > 0 && resendDisabled) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [seconds, resendDisabled]);

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      setIsLoading(true);

      if (!signIn || !email) {
        Alert.alert(
          "Error",
          "Missing email information. Please go back to the login screen."
        );
        router.replace("/(auth)/login");
        return;
      }

      await signIn.create({
        identifier: email as string,
        strategy: "email_code",
      });

      // Reset the timer
      setSeconds(30);
      setResendDisabled(true);

      Alert.alert(
        "Success",
        "A new verification code has been sent to your email."
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to resend verification code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);

      if (!signIn) {
        Alert.alert(
          "Error",
          "Authentication session not found. Please try again."
        );
        router.replace("/(auth)/login");
        return;
      }

      const code = verificationCode.join("");
      const { status, createdSessionId } = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (status === "complete" && createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Verification Failed",
          "Please check your code and try again."
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Verification Error",
        error.message || "Failed to verify the code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => router.back();

  const isVerifyDisabled =
    verificationCode.some((digit) => !digit) || isLoading;

  return (
    <KeyboardAvoidingView
      style={localStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <View style={localStyles.header}>
        <TouchableOpacity onPress={goBack} style={localStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={localStyles.headerContent}>
          <FontAwesome5 name="dumbbell" size={24} color={COLORS.primary} />
          <Text style={localStyles.headerTitle}>Verification</Text>
        </View>
        <View style={localStyles.placeholderButton} />
      </View>

      <View style={localStyles.content}>
        <Text style={localStyles.title}>Verify Your Email</Text>
        <Text style={localStyles.subtitle}>
          We've sent a 6-digit verification code to{" "}
          <Text style={localStyles.emailText}>{email}</Text>
        </Text>{" "}
        <View style={localStyles.otpContainer}>
          <OTPInput
            length={6}
            value={verificationCode.join("")}
            onChange={(value) => {
              const valueArray = value.split("");
              setVerificationCode(
                Array(6)
                  .fill("")
                  .map((_, i) => valueArray[i] || "")
              );
            }}
          />
        </View>
        <View style={localStyles.resendContainer}>
          <Text style={localStyles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={resendDisabled}>
            <Text
              style={[
                localStyles.resendButton,
                resendDisabled && localStyles.disabledText,
              ]}
            >
              {resendDisabled ? `Resend in ${seconds}s` : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            localStyles.verifyButton,
            isVerifyDisabled && localStyles.disabledButton,
          ]}
          onPress={handleVerifyCode}
          disabled={isVerifyDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={localStyles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
