import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  isEarned: boolean;
  earnedDate?: string;
  progress?: number;
  threshold?: number;
}

export default function BadgeCard({
  icon,
  name,
  description,
  isEarned,
  earnedDate,
  progress,
  threshold,
}: BadgeCardProps) {
  const progressPercentage =
    progress !== undefined && threshold !== undefined
      ? Math.min((progress / threshold) * 100, 100)
      : 0;

  return (
    <View style={[styles.container, !isEarned && styles.containerLocked]}>
      <View style={[styles.iconContainer, !isEarned && styles.iconLocked]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, !isEarned && styles.textLocked]}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        {isEarned && earnedDate ? (
          <Text style={styles.earnedDate}>Earned: {earnedDate}</Text>
        ) : (
          progress !== undefined &&
          threshold !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{threshold}
              </Text>
            </View>
          )
        )}
      </View>
      {isEarned && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  iconLocked: {
    backgroundColor: colors.surface.tertiary,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  textLocked: {
    color: colors.text.tertiary,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  earnedDate: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    marginTop: spacing.xs,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface.tertiary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "bold",
  },
});
