import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { AppColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { ComplaintStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: ComplaintStatus | string;
}

const statusStyles: Record<string, { backgroundColor: string; textColor: string }> = {
  Reported: {
    backgroundColor: AppColors.statusReportedBg,
    textColor: AppColors.statusReportedText,
  },
  Assigned: {
    backgroundColor: AppColors.statusAssignedBg,
    textColor: AppColors.statusAssignedText,
  },
  "In Progress": {
    backgroundColor: AppColors.statusInProgressBg,
    textColor: AppColors.statusInProgressText,
  },
  Resolved: {
    backgroundColor: AppColors.statusResolvedBg,
    textColor: AppColors.statusResolvedText,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || {
    backgroundColor: "#f3f4f6",
    textColor: "#6b7280",
  };

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  text: {
    ...Typography.badge,
  },
});
