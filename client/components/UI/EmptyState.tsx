import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export default function EmptyState({
  icon = "document-text-outline",
  title,
  message,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
