import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface ConfidenceBadgeProps {
  score: number;
}

export default function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return colors.success;
    if (confidence >= 70) return colors.primary;
    if (confidence >= 50) return colors.warning;
    return colors.error;
  };

  const color = getConfidenceColor(score);

  return (
    <View style={[styles.container, { backgroundColor: color + "20" }]}>
      <Ionicons name="analytics" size={12} color={color} />
      <Text style={[styles.text, { color }]}>{score}% AI</Text>
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
    gap: 3,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
});
