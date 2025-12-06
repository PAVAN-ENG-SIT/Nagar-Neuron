import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isPositive ? "arrow-up" : "arrow-down"}
            size={12}
            color={trend.isPositive ? colors.success : colors.error}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend.isPositive ? colors.success : colors.error },
            ]}
          >
            {trend.value}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 2,
  },
  trendText: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
});
