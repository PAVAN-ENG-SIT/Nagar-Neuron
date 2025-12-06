import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { colors, spacing, typography, borderRadius, shadows } from "@/constants/theme";

type Insight = {
  id: string;
  type: "prediction" | "trend" | "alert" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  timestamp: string;
  actionable: boolean;
};

const MOCK_INSIGHTS: Insight[] = [
  {
    id: "1",
    type: "prediction",
    title: "Pothole Surge Expected",
    description:
      "Based on weather patterns and historical data, expect 25% increase in pothole reports in the next 2 weeks due to monsoon season.",
    impact: "high",
    timestamp: "2 hours ago",
    actionable: true,
  },
  {
    id: "2",
    type: "trend",
    title: "Garbage Complaints Decreasing",
    description:
      "Garbage-related complaints have decreased by 18% in Indiranagar after the new collection schedule was implemented.",
    impact: "medium",
    timestamp: "5 hours ago",
    actionable: false,
  },
  {
    id: "3",
    type: "alert",
    title: "Drainage Issues Critical",
    description:
      "HSR Layout has 3x higher drainage complaints than average. Immediate attention recommended before monsoon intensifies.",
    impact: "high",
    timestamp: "1 day ago",
    actionable: true,
  },
  {
    id: "4",
    type: "recommendation",
    title: "Optimize Patrol Routes",
    description:
      "Shifting patrol focus to Koramangala 4th Block between 6-9 PM could address 40% more complaints efficiently.",
    impact: "medium",
    timestamp: "2 days ago",
    actionable: true,
  },
  {
    id: "5",
    type: "trend",
    title: "Resolution Time Improving",
    description:
      "Average resolution time has improved from 5.2 days to 4.1 days over the past month across all categories.",
    impact: "low",
    timestamp: "3 days ago",
    actionable: false,
  },
];

const getInsightIcon = (type: string) => {
  switch (type) {
    case "prediction":
      return "auto-awesome";
    case "trend":
      return "trending-up";
    case "alert":
      return "warning";
    case "recommendation":
      return "lightbulb";
    default:
      return "info";
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case "prediction":
      return colors.primary;
    case "trend":
      return colors.success;
    case "alert":
      return colors.error;
    case "recommendation":
      return colors.warning;
    default:
      return colors.info;
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high":
      return colors.error;
    case "medium":
      return colors.warning;
    case "low":
      return colors.success;
    default:
      return colors.text.secondary;
  }
};

export default function InsightsScreen() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights] = useState<Insight[]>(MOCK_INSIGHTS);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const renderInsightCard = (insight: Insight) => {
    const iconColor = getInsightColor(insight.type);
    const impactColor = getImpactColor(insight.impact);

    return (
      <View key={insight.id} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <MaterialIcons name={getInsightIcon(insight.type) as any} size={24} color={iconColor} />
          </View>
          <View style={styles.insightMeta}>
            <Text style={styles.insightType}>
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
            </Text>
            <Text style={styles.insightTimestamp}>{insight.timestamp}</Text>
          </View>
          <View style={[styles.impactBadge, { backgroundColor: `${impactColor}15` }]}>
            <Text style={[styles.impactText, { color: impactColor }]}>
              {insight.impact.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDescription}>{insight.description}</Text>

        {insight.actionable && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Take Action</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const summaryStats = {
    predictions: insights.filter((i) => i.type === "prediction").length,
    alerts: insights.filter((i) => i.type === "alert").length,
    recommendations: insights.filter((i) => i.type === "recommendation").length,
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("ai_insights")}</Text>
          <Text style={styles.subtitle}>
            AI-powered analysis and recommendations
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
            <Text style={styles.summaryNumber}>{summaryStats.predictions}</Text>
            <Text style={styles.summaryLabel}>Predictions</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="warning" size={20} color={colors.error} />
            <Text style={styles.summaryNumber}>{summaryStats.alerts}</Text>
            <Text style={styles.summaryLabel}>Alerts</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="lightbulb" size={20} color={colors.warning} />
            <Text style={styles.summaryNumber}>{summaryStats.recommendations}</Text>
            <Text style={styles.summaryLabel}>Actions</Text>
          </View>
        </View>

        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <MaterialIcons name="psychology" size={24} color={colors.primary} />
            <Text style={styles.confidenceTitle}>AI Model Confidence</Text>
          </View>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: "87%" }]} />
          </View>
          <Text style={styles.confidenceValue}>87% accuracy on predictions</Text>
          <Text style={styles.confidenceSubtext}>
            Based on 1,247 verified predictions over the past 90 days
          </Text>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          {insights.map(renderInsightCard)}
        </View>
      </ScrollView>
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
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  summaryNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  confidenceCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  confidenceTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.background.muted,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  confidenceValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  confidenceSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  insightsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  insightCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  insightMeta: {
    flex: 1,
  },
  insightType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  insightTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  impactBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  impactText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  insightTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  insightDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});
