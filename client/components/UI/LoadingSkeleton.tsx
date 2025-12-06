import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors, spacing, borderRadius } from "@/constants/theme";

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function LoadingSkeleton({
  width = "100%",
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ComplaintCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <LoadingSkeleton width={80} height={80} borderRadius={borderRadius.md} />
      <View style={styles.cardContent}>
        <LoadingSkeleton width="60%" height={16} />
        <LoadingSkeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
        <LoadingSkeleton width="40%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surface.tertiary,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
});
