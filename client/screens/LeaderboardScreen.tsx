import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, LeaderboardEntry } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, Typography, Shadows, BorderRadius } from "@/constants/theme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

function LeaderboardItem({ item, isCurrentUser }: { item: LeaderboardEntry; isCurrentUser: boolean }) {
  const { theme } = useTheme();

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return AppColors.textSecondary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "emoji-events";
    if (rank === 2) return "workspace-premium";
    if (rank === 3) return "military-tech";
    return null;
  };

  const rankIcon = getRankIcon(item.rank);

  return (
    <View
      style={[
        styles.leaderboardItem,
        { backgroundColor: theme.cardBackground },
        isCurrentUser && styles.currentUserItem,
      ]}
    >
      <View style={styles.rankContainer}>
        {rankIcon ? (
          <MaterialIcons name={rankIcon as any} size={28} color={getRankColor(item.rank)} />
        ) : (
          <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
            #{item.rank}
          </Text>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: isCurrentUser ? AppColors.primary : theme.backgroundSecondary }]}>
          <Text style={[styles.avatarText, { color: isCurrentUser ? "#fff" : theme.text }]}>
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {item.name || "Anonymous"}
            {isCurrentUser && " (You)"}
          </Text>
          <Text style={styles.userStats}>
            {item.totalReports} reports
          </Text>
        </View>
      </View>

      <View style={styles.pointsContainer}>
        <MaterialIcons name="stars" size={18} color={AppColors.warning} />
        <Text style={styles.points}>{item.points}</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: leaderboard, isLoading, isError, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: ["api", "leaderboard"],
    queryFn: () => getLeaderboard(50),
  });

  const renderItem = ({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardItem item={item} isCurrentUser={user?.id === item.id} />
  );

  if (isLoading && !leaderboard) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <MaterialIcons name="leaderboard" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top civic heroes in your city</Text>
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <ThemedText style={styles.loadingText}>Loading leaderboard...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isError && !leaderboard) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
          <MaterialIcons name="leaderboard" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top civic heroes in your city</Text>
        </View>
        <View style={styles.errorState}>
          <MaterialIcons name="error-outline" size={64} color={AppColors.error} />
          <ThemedText style={styles.errorText}>Failed to load leaderboard</ThemedText>
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
      <View style={[styles.header, { backgroundColor: AppColors.primary }]}>
        <MaterialIcons name="leaderboard" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top civic heroes in your city</Text>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="people" size={64} color={AppColors.textMuted} />
            <ThemedText style={styles.emptyText}>
              No leaderboard data yet
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    color: "#fff",
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    ...Typography.h3,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Typography.body,
    fontWeight: "600",
  },
  nameContainer: {
    marginLeft: Spacing.sm,
  },
  userName: {
    ...Typography.body,
    fontWeight: "600",
  },
  userStats: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  points: {
    ...Typography.h4,
    color: AppColors.warning,
    marginLeft: Spacing.xs,
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
