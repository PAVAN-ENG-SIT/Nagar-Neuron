import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getAllBadges, Badge } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, Typography, Shadows, BorderRadius } from "@/constants/theme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Card from "@/components/Card";

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badgeCard,
        { backgroundColor: theme.cardBackground },
        !earned && styles.badgeLocked,
      ]}
    >
      <View style={[styles.badgeIconContainer, earned && styles.badgeIconEarned]}>
        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
      </View>
      <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
      <View style={styles.thresholdContainer}>
        <MaterialIcons
          name={earned ? "check-circle" : "lock"}
          size={14}
          color={earned ? AppColors.success : AppColors.textMuted}
        />
        <Text style={[styles.thresholdText, earned && styles.thresholdEarned]}>
          {earned ? "Unlocked" : `Requires ${badge.threshold}`}
        </Text>
      </View>
    </View>
  );
}

export default function BadgesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: badges, isLoading, isError, refetch } = useQuery<Badge[]>({
    queryKey: ["api", "badges"],
    queryFn: getAllBadges,
  });

  const earnedBadgeIds = new Set(user?.badges?.map((b) => b.id) || []);
  const earnedBadges = badges?.filter((b) => earnedBadgeIds.has(b.id)) || [];
  const lockedBadges = badges?.filter((b) => !earnedBadgeIds.has(b.id)) || [];

  if (isLoading && !badges) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="workspace-premium" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>Loading badges...</Text>
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <ThemedText style={styles.loadingText}>Loading achievements...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isError && !badges) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="workspace-premium" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={64} color={AppColors.error} />
          <ThemedText style={styles.errorText}>Failed to load badges</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="workspace-premium" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>
            {earnedBadges.length} of {badges?.length || 0} badges earned
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${badges?.length ? (earnedBadges.length / badges.length) * 100 : 0}%`,
                },
              ]}
            />
          </View>
        </View>

        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Earned Badges</ThemedText>
            <View style={styles.badgesGrid}>
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} earned={true} />
              ))}
            </View>
          </View>
        )}

        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Locked Badges</ThemedText>
            <View style={styles.badgesGrid}>
              {lockedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} earned={false} />
              ))}
            </View>
          </View>
        )}

        {!badges?.length && (
          <View style={styles.emptyState}>
            <MaterialIcons name="emoji-events" size={64} color={AppColors.textMuted} />
            <ThemedText style={styles.emptyText}>
              No badges available yet
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: "#fff",
  },
  headerSubtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  badgeCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    ...Shadows.small,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  badgeIconEarned: {
    backgroundColor: "#FEF3C7",
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    ...Typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  badgeDescription: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  thresholdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BorderRadius.sm,
  },
  thresholdText: {
    ...Typography.caption,
    color: AppColors.textMuted,
    marginLeft: 4,
  },
  thresholdEarned: {
    color: AppColors.success,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: AppColors.textMuted,
    marginTop: Spacing.md,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: AppColors.textSecondary,
    marginTop: Spacing.md,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    color: AppColors.error,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: "#fff",
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
});
