import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ComplaintCard } from "@/components/ComplaintCard";
import { queryClient } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Complaint, ComplaintCategory, ComplaintStatus, ComplaintStats } from "@shared/schema";

const CATEGORIES: (ComplaintCategory | "all")[] = ["all", "pothole", "garbage", "streetlight", "drainage", "other"];
const STATUSES: (ComplaintStatus | "all")[] = ["all", "Reported", "Assigned", "In Progress", "Resolved"];

interface FilterChipProps {
  label: string;
  isActive: boolean;
  color?: string;
  onPress: () => void;
  theme: any;
}

function FilterChip({ label, isActive, color, onPress, theme }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: isActive ? (color || AppColors.primary) : theme.cardBackground,
          borderColor: isActive ? (color || AppColors.primary) : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{
          color: isActive ? "#FFFFFF" : theme.text,
          fontWeight: isActive ? "600" : "400",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface StatSummaryCardProps {
  title: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  theme: any;
}

function StatSummaryCard({ title, value, icon, color, theme }: StatSummaryCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderLeftColor: color }]}>
      <MaterialIcons name={icon} size={24} color={color} />
      <ThemedText type="h3" style={{ color }}>
        {value}
      </ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {title}
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "all">("all");

  const { data: complaints = [], isLoading, refetch, isRefetching } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const { data: stats } = useQuery<ComplaintStats>({
    queryKey: ["/api/stats"],
  });

  const filteredComplaints = complaints.filter((complaint) => {
    const categoryMatch = selectedCategory === "all" || complaint.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || complaint.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    refetch();
  }, [refetch]);

  const handleComplaintPress = useCallback((complaintId: string) => {
    navigation.navigate("Detail", { complaintId });
  }, [navigation]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pothole: AppColors.categoryPothole,
      garbage: AppColors.categoryGarbage,
      streetlight: AppColors.categoryStreetlight,
      drainage: AppColors.categoryDrainage,
      other: AppColors.categoryOther,
    };
    return colors[category];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Reported: AppColors.warning,
      Assigned: AppColors.primary,
      "In Progress": "#f97316",
      Resolved: AppColors.success,
    };
    return colors[status];
  };

  const renderHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsSummary}
        contentContainerStyle={styles.statsSummaryContent}
      >
        <StatSummaryCard
          title="Total"
          value={stats?.total || 0}
          icon="list-alt"
          color={AppColors.primary}
          theme={theme}
        />
        <StatSummaryCard
          title="Open"
          value={stats?.open || 0}
          icon="warning"
          color={AppColors.warning}
          theme={theme}
        />
        <StatSummaryCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon="check-circle"
          color={AppColors.success}
          theme={theme}
        />
      </ScrollView>

      <ThemedText type="small" style={[styles.filterLabel, { color: theme.textSecondary }]}>
        Category
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((category) => (
          <FilterChip
            key={category}
            label={category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            isActive={selectedCategory === category}
            color={category !== "all" ? getCategoryColor(category) : undefined}
            onPress={() => setSelectedCategory(category)}
            theme={theme}
          />
        ))}
      </ScrollView>

      <ThemedText type="small" style={[styles.filterLabel, { color: theme.textSecondary }]}>
        Status
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {STATUSES.map((status) => (
          <FilterChip
            key={status}
            label={status === "all" ? "All" : status}
            isActive={selectedStatus === status}
            color={status !== "all" ? getStatusColor(status) : undefined}
            onPress={() => setSelectedStatus(status)}
            theme={theme}
          />
        ))}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <ThemedText type="h4">
          Complaints
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {filteredComplaints.length} found
        </ThemedText>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="inbox" size={64} color={theme.textMuted} />
      <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
        No complaints found
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
        {selectedCategory !== "all" || selectedStatus !== "all"
          ? "Try adjusting your filters"
          : "No complaints have been submitted yet"}
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl + Spacing.fabSize,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={filteredComplaints}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ComplaintCard
          complaint={item}
          onPress={() => handleComplaintPress(item.id)}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={AppColors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsSummary: {
    marginBottom: Spacing.lg,
  },
  statsSummaryContent: {
    gap: Spacing.md,
  },
  statCard: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    minWidth: 100,
    ...Shadows.small,
  },
  filterLabel: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
});
