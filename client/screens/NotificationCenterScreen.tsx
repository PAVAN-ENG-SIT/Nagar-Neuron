import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import { colors, spacing, typography, borderRadius, shadows } from "@/constants/theme";
import EmptyState from "@/components/UI/EmptyState";

type Notification = {
  id: string;
  type: "status_change" | "nearby_complaint" | "points_earned" | "badge_unlocked" | "verification_request" | "complaint_resolved";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "badge_unlocked",
    title: "New Badge Unlocked!",
    message: "You've earned the 'Civic Hero' badge for reporting 50 complaints",
    timestamp: "5 min ago",
    read: false,
    data: { badgeId: "civic_hero" },
  },
  {
    id: "2",
    type: "status_change",
    title: "Complaint Status Updated",
    message: "Your pothole report on MG Road has been assigned to a team",
    timestamp: "1 hour ago",
    read: false,
    data: { complaintId: "123", newStatus: "assigned" },
  },
  {
    id: "3",
    type: "points_earned",
    title: "Points Earned!",
    message: "You earned 25 points for verifying a complaint",
    timestamp: "3 hours ago",
    read: true,
    data: { points: 25 },
  },
  {
    id: "4",
    type: "verification_request",
    title: "Verification Request",
    message: "A complaint near you needs verification. Help the community!",
    timestamp: "5 hours ago",
    read: true,
    data: { complaintId: "456" },
  },
  {
    id: "5",
    type: "complaint_resolved",
    title: "Issue Resolved",
    message: "The streetlight issue you reported has been fixed",
    timestamp: "1 day ago",
    read: true,
    data: { complaintId: "789" },
  },
  {
    id: "6",
    type: "nearby_complaint",
    title: "New Issue Nearby",
    message: "A new garbage dump has been reported 0.5 km from you",
    timestamp: "2 days ago",
    read: true,
    data: { complaintId: "101", distance: "0.5 km" },
  },
];

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case "status_change":
      return "update";
    case "nearby_complaint":
      return "location-on";
    case "points_earned":
      return "stars";
    case "badge_unlocked":
      return "military-tech";
    case "verification_request":
      return "verified";
    case "complaint_resolved":
      return "check-circle";
    default:
      return "notifications";
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case "status_change":
      return colors.info;
    case "nearby_complaint":
      return colors.primary;
    case "points_earned":
      return colors.warning;
    case "badge_unlocked":
      return colors.success;
    case "verification_request":
      return colors.primary;
    case "complaint_resolved":
      return colors.success;
    default:
      return colors.text.secondary;
  }
};

export default function NotificationCenterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <MaterialIcons name={getNotificationIcon(item.type) as any} size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t("notifications")}</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            message="You're all caught up! Check back later for updates."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: "#fff",
  },
  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  markAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
});
