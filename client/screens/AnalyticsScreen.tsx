import React, { useState } from "react";
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
import StatCard from "@/components/Cards/StatCard";
import PieChartCard from "@/components/Charts/PieChartCard";
import LineChartCard from "@/components/Charts/LineChartCard";
import BarChartCard from "@/components/Charts/BarChartCard";
import FilterBar from "@/components/UI/FilterBar";

const TIME_FILTERS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

const MOCK_STATS = {
  totalComplaints: 1247,
  resolvedComplaints: 892,
  averageResolutionDays: 4.2,
  resolutionRate: 71.5,
};

const CATEGORY_DATA = [
  { name: "Pothole", value: 35, color: colors.category.pothole },
  { name: "Garbage", value: 28, color: colors.category.garbage },
  { name: "Streetlight", value: 18, color: colors.category.streetlight },
  { name: "Drainage", value: 12, color: colors.category.drainage },
  { name: "Other", value: 7, color: colors.category.other },
];

const TREND_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_DATA = [45, 52, 38, 65, 48, 32, 28];

const AREA_LABELS = ["Indiranagar", "Koramangala", "HSR", "BTM", "JP Nagar"];
const AREA_DATA = [156, 142, 128, 115, 98];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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
          <Text style={styles.title}>{t("analytics")}</Text>
          <TouchableOpacity style={styles.exportButton}>
            <MaterialIcons name="file-download" size={20} color={colors.primary} />
            <Text style={styles.exportButtonText}>{t("export_report")}</Text>
          </TouchableOpacity>
        </View>

        <FilterBar
          options={TIME_FILTERS}
          selectedKey={selectedTimeFilter}
          onSelect={setSelectedTimeFilter}
        />

        <View style={styles.statsGrid}>
          <StatCard
            title={t("total_complaints")}
            value={MOCK_STATS.totalComplaints.toString()}
            icon="document-text"
            color={colors.primary}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title={t("resolved")}
            value={MOCK_STATS.resolvedComplaints.toString()}
            icon="checkmark-circle"
            color={colors.success}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title={t("resolution_rate")}
            value={`${MOCK_STATS.resolutionRate}%`}
            icon="trending-up"
            color={colors.info}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title={t("avg_resolution_time")}
            value={`${MOCK_STATS.averageResolutionDays} ${t("days")}`}
            icon="time"
            color={colors.warning}
            trend={{ value: 2, isPositive: false }}
          />
        </View>

        <View style={styles.chartsSection}>
          <PieChartCard
            title={t("category_distribution")}
            data={CATEGORY_DATA}
          />

          <LineChartCard
            title={t("trends_over_time")}
            labels={TREND_LABELS}
            data={TREND_DATA}
          />

          <BarChartCard
            title={t("top_areas")}
            labels={AREA_LABELS}
            data={AREA_DATA}
          />
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>{t("ai_insights")}</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialIcons name="lightbulb" size={24} color={colors.warning} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Peak Reporting Time</Text>
              <Text style={styles.insightText}>
                Most complaints are reported between 6 PM - 9 PM on weekdays
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialIcons name="trending-up" size={24} color={colors.success} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Improving Areas</Text>
              <Text style={styles.insightText}>
                Resolution rate in Indiranagar increased by 15% this month
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialIcons name="warning" size={24} color={colors.error} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Attention Needed</Text>
              <Text style={styles.insightText}>
                Drainage issues in HSR Layout are 40% higher than average
              </Text>
            </View>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  exportButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.lg,
    gap: spacing.md,
  },
  chartsSection: {
    padding: spacing.lg,
    gap: spacing.lg,
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
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.muted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
