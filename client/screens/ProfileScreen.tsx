import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, User, Badge } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, Typography, Shadows, BorderRadius } from "@/constants/theme";
import Card from "@/components/Card";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

function StatCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialIcons name={icon as any} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BadgeItem({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <View style={[styles.badgeItem, !earned && styles.badgeLocked]}>
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
        {badge.name}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, logout, refreshUser } = useAuth();

  const { data: profile, isLoading, isError, error, refetch } = useQuery<User>({
    queryKey: ["api", "user", "profile"],
    queryFn: () => (user ? getUserProfile(user.id) : Promise.reject("No user")),
    enabled: !!user,
  });

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="person-off" size={64} color={AppColors.textMuted} />
          <ThemedText style={styles.emptyText}>Please log in to view your profile</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isLoading && !profile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isError && !profile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={64} color={AppColors.error} />
          <ThemedText style={styles.errorText}>
            Failed to load profile
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const displayProfile = profile || user;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { refetch(); refreshUser(); }} />
        }
      >
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayProfile.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            {displayProfile.rank && displayProfile.rank <= 10 && (
              <View style={styles.rankBadge}>
                <MaterialIcons name="emoji-events" size={14} color="#FFD700" />
                <Text style={styles.rankText}>#{displayProfile.rank}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{displayProfile.name || "Anonymous"}</Text>
          <Text style={styles.userPhone}>{displayProfile.phone}</Text>

          <View style={styles.pointsContainer}>
            <MaterialIcons name="stars" size={24} color="#FFD700" />
            <Text style={styles.pointsValue}>{displayProfile.points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="report"
            value={displayProfile.totalReports}
            label="Reports"
            color={AppColors.primary}
          />
          <StatCard
            icon="verified"
            value={displayProfile.totalVerifications}
            label="Verified"
            color={AppColors.success}
          />
          <StatCard
            icon="local-fire-department"
            value={displayProfile.streak}
            label="Streak"
            color={AppColors.warning}
          />
          <StatCard
            icon="leaderboard"
            value={displayProfile.rank ? `#${displayProfile.rank}` : "-"}
            label="Rank"
            color={AppColors.info}
          />
        </View>

        <Card style={styles.badgesCard}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Badges</ThemedText>
            <Text style={styles.badgeCount}>
              {displayProfile.badges?.length || 0} earned
            </Text>
          </View>
          <View style={styles.badgesGrid}>
            {displayProfile.badges && displayProfile.badges.length > 0 ? (
              displayProfile.badges.map((badge) => (
                <BadgeItem key={badge.id} badge={badge} earned={true} />
              ))
            ) : (
              <Text style={styles.noBadges}>
                Start reporting to earn badges!
              </Text>
            )}
          </View>
        </Card>

        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="history" size={24} color={AppColors.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>My Reports</Text>
            <MaterialIcons name="chevron-right" size={24} color={AppColors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="language" size={24} color={AppColors.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Language</Text>
            <Text style={styles.menuValue}>{displayProfile.language?.toUpperCase() || "EN"}</Text>
            <MaterialIcons name="chevron-right" size={24} color={AppColors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={logout}
          >
            <MaterialIcons name="logout" size={24} color={AppColors.error} />
            <Text style={[styles.menuText, { color: AppColors.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: AppColors.primary,
  },
  rankBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    ...Shadows.small,
  },
  rankText: {
    ...Typography.caption,
    fontWeight: "bold",
    color: AppColors.primary,
    marginLeft: 2,
  },
  userName: {
    ...Typography.h2,
    color: "#fff",
    marginTop: Spacing.md,
  },
  userPhone: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  pointsValue: {
    ...Typography.h2,
    color: "#fff",
    marginLeft: Spacing.sm,
  },
  pointsLabel: {
    ...Typography.body,
    color: "rgba(255,255,255,0.9)",
    marginLeft: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.md,
    marginTop: -Spacing.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: "1%",
    marginBottom: Spacing.sm,
    alignItems: "center",
    borderLeftWidth: 3,
    ...Shadows.small,
  },
  statValue: {
    ...Typography.h2,
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  badgesCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  badgeCount: {
    ...Typography.caption,
    color: AppColors.textSecondary,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badgeItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  badgeNameLocked: {
    color: AppColors.textMuted,
  },
  noBadges: {
    ...Typography.body,
    color: AppColors.textMuted,
    textAlign: "center",
    width: "100%",
    paddingVertical: Spacing.lg,
  },
  menuSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  menuText: {
    flex: 1,
    ...Typography.body,
    marginLeft: Spacing.md,
  },
  menuValue: {
    ...Typography.body,
    color: AppColors.textSecondary,
    marginRight: Spacing.sm,
  },
  logoutItem: {
    backgroundColor: "rgba(239,68,68,0.1)",
    marginTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: AppColors.textMuted,
    marginTop: Spacing.md,
    textAlign: "center",
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
