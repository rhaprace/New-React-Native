import React, { useRef, useCallback, useEffect, memo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, FONT, SPACING, RADIUS } from "@/constants/theme";
import { Text } from "@/components/ui";

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = memo(
  ({ length, value, onChange }) => {
    const inputRef = useRef<TextInput>(null);

    // Focus input on mount and when component regains focus
    useEffect(() => {
      // Add a small delay to ensure the component is fully mounted
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);

      const focusListener = Keyboard.addListener("keyboardDidHide", () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      });

      return () => {
        clearTimeout(focusTimer);
        focusListener.remove();
      };
    }, []);

    // Re-focus when value changes
    useEffect(() => {
      if (inputRef.current && Platform.OS === "android") {
        inputRef.current.focus();
      }
    }, [value]);

    // Handle input changes
    const handleChange = useCallback(
      (text: string) => {
        // Only allow numbers and limit to length
        const cleanText = text.replace(/[^0-9]/g, "").slice(0, length);
        onChange(cleanText);
      },
      [length, onChange]
    );

    const handlePress = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    // Split value into array and pad with empty strings
    const digits = value.padEnd(length, "").split("");

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.container}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={length}
            style={[
              styles.hiddenInput,
              Platform.OS === "ios" ? styles.iosInput : styles.androidInput,
            ]}
            caretHidden={true}
            autoComplete="off"
            textContentType="oneTimeCode"
            autoFocus={true}
          />
          <View style={styles.boxesContainer}>
            {digits.map((digit, index) => (
              <TouchableWithoutFeedback key={index} onPress={handlePress}>
                <View
                  style={[
                    styles.box,
                    digit ? styles.boxFilled : styles.boxEmpty,
                    value.length === index && styles.boxFocused,
                  ]}
                >
                  <Text style={styles.digit}>{digit}</Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

OTPInput.displayName = "OTPInput";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  hiddenInput: {
    width: 300, // Make it wide enough to cover the boxes
    height: 50,
    opacity: 0,
    position: "absolute",
  },
  iosInput: {
    left: 0,
    top: 0,
  },
  androidInput: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
    height: "100%",
    width: "100%",
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
  },
  box: {
    width: 45,
    height: 45,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  boxEmpty: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  boxFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  digit: {
    fontSize: FONT.size.xl,
    color: COLORS.textPrimary,
  },
});

export default OTPInput;
