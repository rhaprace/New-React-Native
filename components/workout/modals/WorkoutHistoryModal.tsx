import React from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/workout.styles";
import { Text } from "@/components/ui";

interface HistoryItem {
  date: string;
  totalCaloriesBurned: number;
  totalDuration: number;
  exerciseCount: number;
}

interface WorkoutHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  history: HistoryItem[] | undefined;
}

const WorkoutHistoryModal: React.FC<WorkoutHistoryModalProps> = ({
  visible,
  onClose,
  history,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text variant="h5" weight="semibold">
            Workout History
          </Text>

          {history ? (
            <FlatList
              data={history}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text variant="body1" weight="medium">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <View style={styles.historyDetails}>
                    <View style={styles.historyDetail}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={16}
                        color={COLORS.error}
                      />
                      <Text variant="body2" color="secondary">
                        {item.totalCaloriesBurned} cal
                      </Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text variant="body2" color="secondary">
                        {item.totalDuration} min
                      </Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={16}
                        color={COLORS.secondary}
                      />
                      <Text variant="body2" color="secondary">
                        {item.exerciseCount} exercises
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <ActivityIndicator size="large" color={COLORS.primary} />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text variant="body1" weight="semibold" color="onPrimary">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutHistoryModal;
