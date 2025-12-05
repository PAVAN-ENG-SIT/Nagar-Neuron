import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { ComplaintCategory } from "@shared/schema";

interface CategoryBadgeProps {
  category: ComplaintCategory | string;
}

const categoryConfig: Record<
  string,
  { color: string; icon: keyof typeof MaterialIcons.glyphMap; label: string }
> = {
  pothole: {
    color: AppColors.categoryPothole,
    icon: "report-problem",
    label: "Pothole",
  },
  garbage: {
    color: AppColors.categoryGarbage,
    icon: "delete",
    label: "Garbage",
  },
  streetlight: {
    color: AppColors.categoryStreetlight,
    icon: "lightbulb",
    label: "Streetlight",
  },
  drainage: {
    color: AppColors.categoryDrainage,
    icon: "water-damage",
    label: "Drainage",
  },
  other: {
    color: AppColors.categoryOther,
    icon: "help-outline",
    label: "Other",
  },
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.color + "20",
          borderColor: config.color,
        },
      ]}
    >
      <MaterialIcons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
