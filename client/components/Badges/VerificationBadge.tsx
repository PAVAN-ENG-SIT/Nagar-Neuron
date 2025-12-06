import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface VerificationBadgeProps {
  count: number;
  required?: number;
  status?: "pending" | "verified" | "community_verified";
}

export default function VerificationBadge({
  count,
  required = 3,
  status,
}: VerificationBadgeProps) {
  const isVerified = status === "verified" || count >= required;
  const bgColor = isVerified ? colors.success + "20" : colors.warning + "20";
  const textColor = isVerified ? colors.success : colors.warning;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Ionicons
        name={isVerified ? "checkmark-circle" : "people"}
        size={14}
        color={textColor}
      />
      <Text style={[styles.text, { color: textColor }]}>
        {isVerified ? "Verified" : `${count}/${required}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
});
