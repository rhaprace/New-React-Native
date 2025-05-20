import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { COLORS, RADIUS, SPACING, SLATE } from "@/constants/theme";

interface MessageBubbleProps {
  content: string;
  isUserMessage: boolean;
  timestamp: string;
  isTyping?: boolean;
}

const MessageBubble = ({
  content,
  isUserMessage,
  timestamp,
}: MessageBubbleProps) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View
      style={[
        styles.container,
        isUserMessage ? styles.userContainer : styles.botContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUserMessage ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          color={isUserMessage ? "onPrimary" : "primary"}
          style={styles.messageText}
        >
          {content}
        </Text>
      </View>
      <Text
        variant="caption"
        color="tertiary"
        style={[
          styles.timestamp,
          isUserMessage ? styles.userTimestamp : styles.botTimestamp,
        ]}
      >
        {formatTime(timestamp)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: "80%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  botContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  botBubble: {
    backgroundColor: SLATE.slate_100,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
  },
  userTimestamp: {
    alignSelf: "flex-end",
  },
  botTimestamp: {
    alignSelf: "flex-start",
  },
});

export default MessageBubble;
