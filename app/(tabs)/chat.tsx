import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Text } from "@/components/ui";
import { MessageBubble, ChatInput } from "@/components/chat";
import { styles } from "@/styles/chat.style";
import { COLORS } from "@/constants/theme";

export default function Chat() {
  const { user } = useUser();
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setIsLoading] = useState(false);
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;
  const messages = useQuery(
    api.chat.getChatMessages,
    userId ? { userId, limit: 50 } : "skip"
  );

  const generateResponse = useMutation(api.chat.generateBotResponse);
  const initChatReset = useAction(api.initChatReset.initChatResetSchedule);

  // Initialize chat reset schedule when the component mounts
  useEffect(() => {
    // Only initialize once when the component mounts
    initChatReset()
      .then((result) => console.log("Chat reset scheduled:", result))
      .catch((error) => console.error("Failed to schedule chat reset:", error));
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await generateResponse({ userId, userMessage: content });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (messages && messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 100);
    }
  }, [messages]);
  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  const displayMessages =
    messages && messages.length > 0
      ? messages
      : [
          {
            _id: "welcome",
            userId,
            content: `Hello ${convexUser?.fullname || user?.firstName || "there"}! I'm your AtleTech assistant. I know all about your fitness data and can help you with:

• Your profile information (age, weight, height, gender, activity level)
• Your calorie goals and tracking
• Your meals and nutrition (breakfast, lunch, dinner)
• Your workouts and exercises
• Your subscription status

I can also provide:
• Personalized fitness tips based on your data
• Progress tracking insights and analysis
• Motivational messages when you need a boost
• Meal and workout recommendations
• Information about your past activities

Note: Our chat conversations reset daily at midnight to keep things fresh!

Try asking me for a fitness tip, a meal recommendation, or insights about your progress!`,
            isUserMessage: false,
            timestamp: new Date().toISOString(),
          },
        ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text variant="h4" weight="bold">
            AtleTechBot
          </Text>
        </View>

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <MessageBubble
                content={item.content}
                isUserMessage={item.isUserMessage}
                timestamp={item.timestamp}
              />
            )}
            contentContainerStyle={styles.messagesContainer}
            inverted
          />
        </View>

        <View style={styles.inputContainer}>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
