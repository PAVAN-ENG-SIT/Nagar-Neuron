import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { useMutation } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { apiRequest, queryClient } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ComplaintCategory } from "@shared/schema";

interface AIClassificationResult {
  category: ComplaintCategory;
  confidence: number;
  alternates: { category: ComplaintCategory; confidence: number }[];
}

const CATEGORY_INFO: Record<ComplaintCategory, { icon: keyof typeof MaterialIcons.glyphMap; color: string; label: string }> = {
  pothole: { icon: "warning", color: AppColors.categoryPothole, label: "Pothole" },
  garbage: { icon: "delete", color: AppColors.categoryGarbage, label: "Garbage" },
  streetlight: { icon: "lightbulb", color: AppColors.categoryStreetlight, label: "Streetlight" },
  drainage: { icon: "water-drop", color: AppColors.categoryDrainage, label: "Drainage" },
  other: { icon: "help-outline", color: AppColors.categoryOther, label: "Other" },
};

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null);

  const pulseAnim = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value === 1 ? 1 : 0.7,
  }));

  const simulateAIClassification = async (): Promise<AIClassificationResult> => {
    const categories: ComplaintCategory[] = ["pothole", "garbage", "streetlight", "drainage", "other"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = 0.75 + Math.random() * 0.2;
    
    const alternates = categories
      .filter(c => c !== randomCategory)
      .slice(0, 2)
      .map(c => ({ category: c, confidence: 0.05 + Math.random() * 0.15 }));

    return {
      category: randomCategory,
      confidence,
      alternates,
    };
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and media library access are required to submit complaints."
      );
    }

    if (locationStatus === "granted") {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      setLocation({ latitude: 12.9716, longitude: 77.5946 });
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true,
          });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
        getCurrentLocation();
        
        setIsClassifying(true);
        setAiResult(null);
        setSelectedCategory(null);
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1,
          true
        );
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        const classification = await simulateAIClassification();
        setAiResult(classification);
        setSelectedCategory(classification.category);
        setIsClassifying(false);
        pulseAnim.value = 1;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsClassifying(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setAiResult(null);
    setSelectedCategory(null);
    setIsClassifying(false);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!imageBase64 || !location) {
        throw new Error("Image and location are required");
      }

      const response = await apiRequest("POST", "/api/complaints", {
        image: imageBase64,
        latitude: location.latitude,
        longitude: location.longitude,
        notes: notes.trim() || undefined,
      });

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      Alert.alert(
        "Complaint Submitted",
        `Your complaint has been registered.\n\nComplaint ID: ${data.id}\nCategory: ${data.category}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to submit complaint. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!imageUri || !location) {
      Alert.alert("Error", "Please select an image and ensure location is available.");
      return;
    }
    setIsUploading(true);
    submitMutation.mutate();
    setIsUploading(false);
  };

  const isSubmitDisabled = !imageUri || !location || submitMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <ThemedText type="body" style={[styles.instructions, { color: theme.textSecondary }]}>
          Take a photo or select from gallery to report a civic issue. Our AI will automatically categorize it.
        </ThemedText>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => pickImage(true)}
            style={({ pressed }) => [
              styles.pickerButton,
              { backgroundColor: AppColors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
            <ThemedText type="body" style={styles.pickerButtonText}>
              Take Photo
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => pickImage(false)}
            style={({ pressed }) => [
              styles.pickerButton,
              {
                backgroundColor: theme.cardBackground,
                borderWidth: 1,
                borderColor: AppColors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialIcons name="photo-library" size={24} color={AppColors.primary} />
            <ThemedText type="body" style={[styles.pickerButtonText, { color: AppColors.primary }]}>
              Gallery
            </ThemedText>
          </Pressable>
        </View>

        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              contentFit="cover"
            />
            <Pressable
              onPress={removeImage}
              style={({ pressed }) => [
                styles.removeButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <MaterialIcons name="add-photo-alternate" size={48} color={theme.textMuted} />
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              No image selected
            </ThemedText>
          </View>
        )}

        <View style={[styles.locationCard, { backgroundColor: theme.cardBackground }]}>
          <MaterialIcons name="location-on" size={20} color={AppColors.primary} />
          {location ? (
            <View style={styles.locationContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Location detected
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </ThemedText>
            </View>
          ) : (
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              Getting location...
            </ThemedText>
          )}
        </View>

        <ThemedText type="h4" style={styles.notesLabel}>
          Additional Notes (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: theme.cardBackground,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Add any additional details about the issue..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: isSubmitDisabled ? theme.textMuted : AppColors.primary,
              opacity: pressed && !isSubmitDisabled ? 0.8 : 1,
            },
          ]}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="send" size={22} color="#FFFFFF" />
              <ThemedText type="body" style={styles.submitButtonText}>
                Submit Complaint
              </ThemedText>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>

      {(isUploading || submitMutation.isPending) && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <ThemedText type="body" style={{ marginTop: Spacing.md }}>
              Processing...
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              AI is analyzing your complaint
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructions: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  pickerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: BorderRadius.md,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: "50%",
    marginRight: -150 + Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  locationContent: {
    gap: Spacing.xs,
  },
  notesLabel: {
    marginBottom: Spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 120,
    marginBottom: Spacing.xl,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    ...Shadows.large,
  },
});
