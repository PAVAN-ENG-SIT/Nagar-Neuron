import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface PointsBadgeProps {
  points: number;
  size?: "small" | "medium" | "large";
}

export default function PointsBadge({ points, size = "medium" }: PointsBadgeProps) {
  const sizes = {
    small: { icon: 12, text: typography.sizes.xs, padding: spacing.xs },
    medium: { icon: 16, text: typography.sizes.sm, padding: spacing.sm },
    large: { icon: 20, text: typography.sizes.md, padding: spacing.md },
  };

  const s = sizes[size];

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: s.padding, paddingVertical: s.padding / 2 },
      ]}
    >
      <Ionicons name="star" size={s.icon} color={colors.warning} />
      <Text style={[styles.text, { fontSize: s.text }]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "20",
    borderRadius: borderRadius.full,
    gap: 4,
  },
  text: {
    fontWeight: "700",
    color: colors.warning,
  },
});
