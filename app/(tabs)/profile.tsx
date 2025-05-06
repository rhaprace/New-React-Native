import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/profile.styles";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculateBMRMifflinStJeor,
  calculateTDEE,
  estimateLeanBodyMass,
  calculateBMRCunningham,
  ActivityLevel as MetabolicActivityLevel,
  Gender as MetabolicGender,
} from "@/utils/metabolicCalculations";

type Gender = "Male" | "Female" | "Other";
type ActivityLevel =
  | "Sedentary"
  | "Lightly Active"
  | "Moderately Active"
  | "Very Active"
  | "Extremely Active";

// Map our activity levels to the ones in metabolicCalculations
const activityLevelMap: Record<ActivityLevel, MetabolicActivityLevel> = {
  Sedentary: "Sedentary",
  "Lightly Active": "Light",
  "Moderately Active": "Moderate",
  "Very Active": "Active",
  "Extremely Active": "Very Active",
};

// For backward compatibility
const activityMultipliers: Record<ActivityLevel, number> = {
  Sedentary: 1.2,
  "Lightly Active": 1.375,
  "Moderately Active": 1.55,
  "Very Active": 1.725,
  "Extremely Active": 1.9,
};

const ProfilePage = () => {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const profile = convexUser?.profile;
  const { signOut } = useAuth();
  const router = useRouter();
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const [weight, setWeight] = useState<string>("");
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);

  const [height, setHeight] = useState<string>("");
  const [isEditingHeight, setIsEditingHeight] = useState<boolean>(false);

  const [age, setAge] = useState<string>("");
  const [isEditingAge, setIsEditingAge] = useState<boolean>(false);

  const [gender, setGender] = useState<Gender | "">("");
  const [isEditingGender, setIsEditingGender] = useState<boolean>(false);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [isEditingActivityLevel, setIsEditingActivityLevel] =
    useState<boolean>(false);

  const [genderModalVisible, setGenderModalVisible] = useState<boolean>(false);
  const [activityModalVisible, setActivityModalVisible] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // New state for BMR calculation method
  const [bmrMethod, setBmrMethod] = useState<"mifflin" | "cunningham">(
    "mifflin"
  );
  const [bmrMethodModalVisible, setBmrMethodModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (convexUser && profile) {
      setName(convexUser.fullname || user?.firstName || "Athlete");
      setWeight(profile.weight?.toString() || "");
      setHeight(profile.height?.toString() || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || "");
      setActivityLevel(profile.activityLevel || "");
    }
  }, [convexUser, profile]);

  const saveProfile = async () => {
    if (!weight || !height || !age || !gender || !activityLevel) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await updateProfile({
        fullname: name,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age, 10),
        gender,
        activityLevel,
        bmr: calculateBMR(
          parseFloat(weight),
          parseFloat(height),
          parseInt(age, 10),
          gender
        ),
        dailyCalories: calculateDailyCalories(
          parseFloat(weight),
          parseFloat(height),
          parseInt(age, 10),
          gender,
          activityLevel
        ),
      });

      Alert.alert("Success", "Profile saved successfully!");
      setError("");
      setIsEditingName(false);
      setIsEditingWeight(false);
      setIsEditingHeight(false);
      setIsEditingAge(false);
      setIsEditingGender(false);
      setIsEditingActivityLevel(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      // Save profile data if needed
      await saveProfile();

      // Sign out the user
      await signOut();

      // Navigate directly to login screen
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Error during sign-out:", err);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const calculateBMR = (
    weight: number,
    height: number,
    age: number,
    gender: Gender
  ): number => {
    if (gender === "Other") {
      // For "Other" gender, use an average of male and female calculations
      const maleBMR = calculateBMRMifflinStJeor(weight, height, age, "Male");
      const femaleBMR = calculateBMRMifflinStJeor(
        weight,
        height,
        age,
        "Female"
      );
      return Math.round((maleBMR + femaleBMR) / 2);
    }

    if (bmrMethod === "mifflin") {
      // Use Mifflin-St Jeor equation (more accurate for general population)
      return calculateBMRMifflinStJeor(
        weight,
        height,
        age,
        gender as MetabolicGender
      );
    } else {
      // Use Cunningham equation (better for athletic individuals)
      // First estimate lean body mass since we don't have body fat percentage
      const lbm = estimateLeanBodyMass(
        weight,
        height,
        gender as MetabolicGender
      );
      return calculateBMRCunningham(lbm);
    }
  };

  const calculateDailyCalories = (
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel
  ): number => {
    const bmr = calculateBMR(weight, height, age, gender);

    // Use the new TDEE calculation function
    if (activityLevel in activityLevelMap) {
      return calculateTDEE(bmr, activityLevelMap[activityLevel]);
    }

    // Fallback to old method
    const multiplier = activityMultipliers[activityLevel];
    return Math.round(bmr * multiplier);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            !isEditingName && { backgroundColor: COLORS.surfaceAlt },
          ]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          editable={isEditingName}
        />
        <TouchableOpacity
          onPress={() => setIsEditingName(!isEditingName)}
          style={styles.editIcon}
        >
          <Ionicons
            name={isEditingName ? "checkmark-outline" : "pencil-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            !isEditingWeight && { backgroundColor: COLORS.surfaceAlt },
          ]}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          editable={isEditingWeight}
        />
        <TouchableOpacity
          onPress={() => setIsEditingWeight(!isEditingWeight)}
          style={styles.editIcon}
        >
          <Ionicons
            name={isEditingWeight ? "checkmark-outline" : "pencil-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            !isEditingHeight && { backgroundColor: COLORS.surfaceAlt },
          ]}
          placeholder="Height (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          editable={isEditingHeight}
        />
        <TouchableOpacity
          onPress={() => setIsEditingHeight(!isEditingHeight)}
          style={styles.editIcon}
        >
          <Ionicons
            name={isEditingHeight ? "checkmark-outline" : "pencil-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            !isEditingAge && { backgroundColor: COLORS.surfaceAlt },
          ]}
          placeholder="Age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          editable={isEditingAge}
        />
        <TouchableOpacity
          onPress={() => setIsEditingAge(!isEditingAge)}
          style={styles.editIcon}
        >
          <Ionicons
            name={isEditingAge ? "checkmark-outline" : "pencil-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            !isEditingGender && { backgroundColor: COLORS.surfaceAlt },
          ]}
          onPress={() => {
            if (isEditingGender) setGenderModalVisible(true);
          }}
        >
          <Text style={styles.selectButtonText}>
            {gender || "Select Gender"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsEditingGender(!isEditingGender)}
          style={styles.editIcon}
        >
          <Ionicons
            name={isEditingGender ? "checkmark-outline" : "pencil-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            !isEditingActivityLevel && { backgroundColor: COLORS.surfaceAlt },
          ]}
          onPress={() => {
            if (isEditingActivityLevel) setActivityModalVisible(true);
          }}
        >
          <Text style={styles.selectButtonText}>
            {activityLevel || "Select Activity Level"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsEditingActivityLevel(!isEditingActivityLevel)}
          style={styles.editIcon}
        >
          <Ionicons
            name={
              isEditingActivityLevel ? "checkmark-outline" : "pencil-outline"
            }
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <Modal visible={genderModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(["Male", "Female", "Other"] as Gender[]).map((g) => (
              <Pressable
                key={g}
                style={styles.option}
                onPress={() => {
                  setGender(g);
                  setGenderModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{g}</Text>
              </Pressable>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setGenderModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={activityModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(Object.keys(activityMultipliers) as ActivityLevel[]).map((a) => (
              <Pressable
                key={a}
                style={styles.option}
                onPress={() => {
                  setActivityLevel(a);
                  setActivityModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{a}</Text>
              </Pressable>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActivityModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.selectButton, { marginBottom: 10 }]}
          onPress={() => setBmrMethodModalVisible(true)}
        >
          <Text style={styles.selectButtonText}>
            BMR Method:{" "}
            {bmrMethod === "mifflin"
              ? "Mifflin-St Jeor (General)"
              : "Cunningham (Athletic)"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={bmrMethodModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.option}
              onPress={() => {
                setBmrMethod("mifflin");
                setBmrMethodModalVisible(false);
              }}
            >
              <Text style={styles.optionText}>
                Mifflin-St Jeor (General Population)
              </Text>
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                setBmrMethod("cunningham");
                setBmrMethodModalVisible(false);
              }}
            >
              <Text style={styles.optionText}>
                Cunningham (Athletic Individuals)
              </Text>
            </Pressable>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setBmrMethodModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProfilePage;
