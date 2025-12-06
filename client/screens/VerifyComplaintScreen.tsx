import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { colors, spacing, typography, borderRadius, shadows } from "@/constants/theme";
import VerificationBadge from "@/components/Badges/VerificationBadge";
import ConfidenceBadge from "@/components/Badges/ConfidenceBadge";

type VerifyComplaintScreenProps = NativeStackScreenProps<any, "VerifyComplaint">;

type VerificationStatus = "exists" | "resolved" | "cannot_verify" | null;

export default function VerifyComplaintScreen({ route, navigation }: VerifyComplaintScreenProps) {
  const { t } = useTranslation();
  const { complaint } = route.params || {};
  
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>(null);
  const [comment, setComment] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      Alert.alert(t("error"), "Please select a verification status");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert(t("success"), t("thank_you_verification"), [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t("error"), "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationOptions = [
    { id: "exists", label: t("still_exists"), icon: "warning", color: colors.warning },
    { id: "resolved", label: t("fixed_resolved"), icon: "check-circle", color: colors.success },
    { id: "cannot_verify", label: t("cannot_verify"), icon: "help", color: colors.text.secondary },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {complaint && (
          <View style={styles.complaintCard}>
            {complaint.imageUrl && (
              <Image
                source={{ uri: complaint.imageUrl }}
                style={styles.complaintImage}
                contentFit="cover"
              />
            )}
            <View style={styles.complaintInfo}>
              <Text style={styles.complaintTitle}>{complaint.title || "Complaint"}</Text>
              <Text style={styles.complaintCategory}>{complaint.category}</Text>
              <View style={styles.badgeRow}>
                <VerificationBadge
                  count={complaint.verificationCount || 0}
                  required={3}
                />
                <ConfidenceBadge score={complaint.aiConfidence || 85} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("verify_this_complaint")}</Text>
          <View style={styles.optionsContainer}>
            {verificationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedStatus === option.id && {
                    borderColor: option.color,
                    backgroundColor: `${option.color}15`,
                  },
                ]}
                onPress={() => setSelectedStatus(option.id as VerificationStatus)}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={32}
                  color={selectedStatus === option.id ? option.color : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    selectedStatus === option.id && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
            <MaterialIcons name="add-a-photo" size={24} color={colors.primary} />
            <Text style={styles.photoButtonText}>{t("add_photo_proof")}</Text>
          </TouchableOpacity>
          {proofImage && (
            <View style={styles.proofImageContainer}>
              <Image source={{ uri: proofImage }} style={styles.proofImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setProofImage(null)}
              >
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TextInput
            style={styles.commentInput}
            placeholder={t("optional_comment")}
            placeholderTextColor={colors.text.tertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.pointsInfo}>
          <MaterialIcons name="stars" size={20} color={colors.warning} />
          <Text style={styles.pointsText}>+10 {t("points_earned")}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !selectedStatus && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedStatus || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="verified" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>{t("submit_verification")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  complaintCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  complaintImage: {
    width: "100%",
    height: 200,
  },
  complaintInfo: {
    padding: spacing.lg,
  },
  complaintTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  complaintCategory: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  optionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.small,
  },
  optionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: "center",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  photoButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  proofImageContainer: {
    marginTop: spacing.md,
    position: "relative",
  },
  proofImage: {
    width: "100%",
    height: 150,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  commentInput: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  pointsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  pointsText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  submitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: "#fff",
  },
});
