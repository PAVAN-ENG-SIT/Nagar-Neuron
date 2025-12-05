import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { queryClient } from "@/lib/query-client";
import { ComplaintStats, Complaint } from "@shared/schema";

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  theme: any;
}

function StatCard({ title, value, icon, color, theme }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <ThemedText type="h2" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={[styles.statTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
  theme: any;
}

function BarChart({ data, maxValue, theme }: BarChartProps) {
  return (
    <View style={styles.barChartContainer}>
      {data.map((item) => (
        <View key={item.label} style={styles.barRow}>
          <ThemedText type="small" style={styles.barLabel}>
            {item.label}
          </ThemedText>
          <View style={[styles.barBackground, { backgroundColor: theme.backgroundSecondary }]}>
            <View
              style={[
                styles.barFill,
                {
                  backgroundColor: item.color,
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <ThemedText type="small" style={styles.barValue}>
            {item.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<ComplaintStats>({
    queryKey: ["/api/stats"],
  });

  const { data: complaints = [] } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const recentComplaints = complaints.slice(0, 5);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
    refetch();
  };

  const categoryData = stats ? [
    { label: "Pothole", value: stats.byCategory.pothole || 0, color: AppColors.categoryPothole },
    { label: "Garbage", value: stats.byCategory.garbage || 0, color: AppColors.categoryGarbage },
    { label: "Streetlight", value: stats.byCategory.streetlight || 0, color: AppColors.categoryStreetlight },
    { label: "Drainage", value: stats.byCategory.drainage || 0, color: AppColors.categoryDrainage },
    { label: "Other", value: stats.byCategory.other || 0, color: AppColors.categoryOther },
  ] : [];

  const statusData = stats ? [
    { label: "Reported", value: stats.byStatus.Reported || 0, color: AppColors.warning },
    { label: "Assigned", value: stats.byStatus.Assigned || 0, color: AppColors.primary },
    { label: "In Progress", value: stats.byStatus["In Progress"] || 0, color: "#f97316" },
    { label: "Resolved", value: stats.byStatus.Resolved || 0, color: AppColors.success },
  ] : [];

  const maxCategoryValue = Math.max(...categoryData.map((d) => d.value), 1);
  const maxStatusValue = Math.max(...statusData.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl + Spacing.fabSize,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={AppColors.primary} />
      }
    >
      <ThemedText type="h3" style={styles.sectionTitle}>
        Overview
      </ThemedText>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total"
          value={stats?.total || 0}
          icon="list-alt"
          color={AppColors.primary}
          theme={theme}
        />
        <StatCard
          title="Open"
          value={stats?.open || 0}
          icon="warning"
          color={AppColors.warning}
          theme={theme}
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon="check-circle"
          color={AppColors.success}
          theme={theme}
        />
        <StatCard
          title="Today"
          value={stats?.today || 0}
          icon="today"
          color={AppColors.danger}
          theme={theme}
        />
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        By Category
      </ThemedText>
      <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
        <BarChart data={categoryData} maxValue={maxCategoryValue} theme={theme} />
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        By Status
      </ThemedText>
      <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
        <BarChart data={statusData} maxValue={maxStatusValue} theme={theme} />
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Recent Activity
      </ThemedText>
      <View style={[styles.recentCard, { backgroundColor: theme.cardBackground }]}>
        {recentComplaints.length === 0 ? (
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No recent complaints
          </ThemedText>
        ) : (
          recentComplaints.map((complaint, index) => (
            <View
              key={complaint.id}
              style={[
                styles.recentItem,
                index < recentComplaints.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={[styles.recentDot, { backgroundColor: getCategoryColor(complaint.category) }]} />
              <View style={styles.recentContent}>
                <ThemedText type="small" numberOfLines={1}>
                  {complaint.location}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {complaint.category} - {new Date(complaint.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    pothole: AppColors.categoryPothole,
    garbage: AppColors.categoryGarbage,
    streetlight: AppColors.categoryStreetlight,
    drainage: AppColors.categoryDrainage,
    other: AppColors.categoryOther,
  };
  return colors[category] || AppColors.categoryOther;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    ...Shadows.small,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statTitle: {
    textAlign: "center",
  },
  chartCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  barChartContainer: {
    gap: Spacing.md,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  barLabel: {
    width: 80,
  },
  barBackground: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
  },
  barValue: {
    width: 30,
    textAlign: "right",
  },
  recentCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recentContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
