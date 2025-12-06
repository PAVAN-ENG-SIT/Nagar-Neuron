import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface HotspotCardProps {
  category: string;
  riskScore: number;
  predictedDate: string;
  recommendedAction: string;
  factors?: string[];
}

export default function HotspotCard({
  category,
  riskScore,
  predictedDate,
  recommendedAction,
  factors = [],
}: HotspotCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return colors.error;
    if (score >= 60) return colors.warning;
    return colors.success;
  };

  const riskColor = getRiskColor(riskScore);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.riskBadge, { backgroundColor: riskColor + "20" }]}>
          <Ionicons name="warning" size={16} color={riskColor} />
          <Text style={[styles.riskText, { color: riskColor }]}>
            {riskScore}% Risk
          </Text>
        </View>
        <Text style={styles.date}>{predictedDate}</Text>
      </View>

      <Text style={styles.category}>{category}</Text>
      <Text style={styles.action}>{recommendedAction}</Text>

      {factors.length > 0 && (
        <View style={styles.factors}>
          {factors.slice(0, 3).map((factor, index) => (
            <View key={index} style={styles.factorChip}>
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
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
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  riskText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  date: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  category: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: "capitalize",
  },
  action: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  factors: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  factorChip: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  factorText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
