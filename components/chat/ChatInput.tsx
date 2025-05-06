import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SLATE } from "@/constants/theme";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "" || isLoading) return;

    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (message.trim() === "" || isLoading) && styles.disabledButton,
        ]}
        onPress={handleSend}
        disabled={message.trim() === "" || isLoading}
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
    // Add elevation to make it appear above content when keyboard is shown
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
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
