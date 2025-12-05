import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Complaint } from "@shared/schema";

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ComplaintCard({ complaint, onPress }: ComplaintCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: AppColors.danger,
      medium: AppColors.warning,
      low: AppColors.success,
    };
    return colors[severity] || AppColors.categoryOther;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, { backgroundColor: theme.cardBackground }, animatedStyle]}
      accessibilityLabel={`Complaint: ${complaint.category} at ${complaint.location}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${complaint.image}` }}
        style={styles.thumbnail}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <CategoryBadge category={complaint.category} />
          <View style={[styles.severityDot, { backgroundColor: getSeverityColor(complaint.severity) }]} />
        </View>
        <ThemedText type="small" numberOfLines={2} style={styles.location}>
          {complaint.location}
        </ThemedText>
        <View style={styles.bottomRow}>
          <StatusBadge status={complaint.status} />
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            {getRelativeTime(complaint.createdAt)}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  location: {
    marginVertical: Spacing.xs,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
