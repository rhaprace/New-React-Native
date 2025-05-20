import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SLATE } from "@/constants/theme";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isTyping?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, isTyping }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const MAX_LENGTH = 500;

  const handleSend = useCallback(() => {
    if (message.trim() === "" || isLoading || isTyping) return;
    if (message.length > MAX_LENGTH) return;

    onSendMessage(message.trim());
    setMessage("");
  }, [message, isLoading, isTyping, onSendMessage]);

  const charactersLeft = MAX_LENGTH - message.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, isOverLimit && styles.inputError]}
          placeholder={isTyping ? "AI is typing..." : "Type a message..."}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={MAX_LENGTH}
          editable={!isLoading && !isTyping}
        />
        {message.length > 0 && (
          <Text
            style={[styles.charCount, isOverLimit && styles.charCountError]}
          >
            {charactersLeft}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          (message.trim() === "" || isLoading || isTyping || isOverLimit) &&
            styles.disabledButton,
        ]}
        onPress={handleSend}
        disabled={message.trim() === "" || isLoading || isTyping || isOverLimit}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
        ) : (
          <Ionicons name="send" size={20} color={COLORS.textOnPrimary} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: SLATE.slate_200,
    backgroundColor: COLORS.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
  },
  input: {
    flex: 1,
    backgroundColor: SLATE.slate_100,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    maxHeight: 100,
    fontSize: 16,
    color: SLATE.slate_800,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  charCount: {
    position: "absolute",
    right: 8,
    bottom: 8,
    fontSize: 12,
    color: SLATE.slate_400,
  },
  charCountError: {
    color: COLORS.error,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: SLATE.slate_400,
  },
});

export default ChatInput;
