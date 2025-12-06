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
import HotspotCard from "@/components/Cards/HotspotCard";
import FilterBar from "@/components/UI/FilterBar";
import EmptyState from "@/components/UI/EmptyState";

type Hotspot = {
  id: string;
  areaName: string;
  complaintCount: number;
  topCategory: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  predictedIssues: number;
  coordinates: { lat: number; lng: number };
};

const MOCK_HOTSPOTS: Hotspot[] = [
  {
    id: "1",
    areaName: "Koramangala 4th Block",
    complaintCount: 45,
    topCategory: "pothole",
    riskLevel: "critical",
    predictedIssues: 8,
    coordinates: { lat: 12.9352, lng: 77.6245 },
  },
  {
    id: "2",
    areaName: "HSR Layout Sector 2",
    complaintCount: 38,
    topCategory: "drainage",
    riskLevel: "high",
    predictedIssues: 5,
    coordinates: { lat: 12.9116, lng: 77.6389 },
  },
  {
    id: "3",
    areaName: "Indiranagar 100ft Road",
    complaintCount: 32,
    topCategory: "garbage",
    riskLevel: "medium",
    predictedIssues: 3,
    coordinates: { lat: 12.9783, lng: 77.6408 },
  },
  {
    id: "4",
    areaName: "BTM Layout 2nd Stage",
    complaintCount: 28,
    topCategory: "streetlight",
    riskLevel: "medium",
    predictedIssues: 4,
    coordinates: { lat: 12.9166, lng: 77.6101 },
  },
  {
    id: "5",
    areaName: "JP Nagar 6th Phase",
    complaintCount: 22,
    topCategory: "pothole",
    riskLevel: "low",
    predictedIssues: 2,
    coordinates: { lat: 12.9077, lng: 77.5851 },
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
];

export default function HotspotsScreen() {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hotspots] = useState<Hotspot[]>(MOCK_HOTSPOTS);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const filteredHotspots =
    selectedFilter === "all"
      ? hotspots
      : hotspots.filter((h) => h.riskLevel === selectedFilter);

  const getRiskStats = () => {
    const critical = hotspots.filter((h) => h.riskLevel === "critical").length;
    const high = hotspots.filter((h) => h.riskLevel === "high").length;
    const medium = hotspots.filter((h) => h.riskLevel === "medium").length;
    const low = hotspots.filter((h) => h.riskLevel === "low").length;
    return { critical, high, medium, low };
  };

  const riskStats = getRiskStats();

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
          <Text style={styles.title}>{t("hotspots")}</Text>
          <Text style={styles.subtitle}>
            AI-identified areas requiring attention
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: `${colors.error}15` }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {riskStats.critical}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: `${colors.warning}15` }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {riskStats.high}
            </Text>
            <Text style={styles.statLabel}>High</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: `${colors.info}15` }]}>
            <Text style={[styles.statNumber, { color: colors.info }]}>
              {riskStats.medium}
            </Text>
            <Text style={styles.statLabel}>Medium</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: `${colors.success}15` }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {riskStats.low}
            </Text>
            <Text style={styles.statLabel}>Low</Text>
          </View>
        </View>

        <FilterBar
          options={FILTERS}
          selectedKey={selectedFilter}
          onSelect={setSelectedFilter}
        />

        <View style={styles.predictionsCard}>
          <View style={styles.predictionsHeader}>
            <MaterialIcons name="auto-awesome" size={24} color={colors.primary} />
            <Text style={styles.predictionsTitle}>{t("predicted_issues")}</Text>
          </View>
          <Text style={styles.predictionsValue}>
            {hotspots.reduce((sum, h) => sum + h.predictedIssues, 0)} issues
          </Text>
          <Text style={styles.predictionsSubtext}>
            Predicted to occur in the next 7 days based on historical patterns
          </Text>
        </View>

        <View style={styles.hotspotsSection}>
          <Text style={styles.sectionTitle}>Problem Areas</Text>
          {filteredHotspots.length > 0 ? (
            filteredHotspots.map((hotspot) => (
              <HotspotCard
                key={hotspot.id}
                category={hotspot.topCategory}
                riskScore={hotspot.riskLevel === "critical" ? 90 : hotspot.riskLevel === "high" ? 75 : hotspot.riskLevel === "medium" ? 55 : 35}
                predictedDate={`${hotspot.predictedIssues} issues predicted`}
                recommendedAction={`${hotspot.areaName}: ${hotspot.complaintCount} complaints`}
              />
            ))
          ) : (
            <EmptyState
              icon="location-outline"
              title="No hotspots found"
              message="No areas match the selected filter"
            />
          )}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.viewMapButton}>
            <MaterialIcons name="map" size={20} color="#fff" />
            <Text style={styles.viewMapButtonText}>View on Map</Text>
          </TouchableOpacity>
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
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBadge: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  predictionsCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  predictionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  predictionsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  predictionsValue: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  predictionsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  hotspotsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  viewMapButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: "#fff",
  },
});
