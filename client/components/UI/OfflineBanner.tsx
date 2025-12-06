import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";

export default function OfflineBanner() {
  const netInfo = useNetInfo();

  if (netInfo.isConnected !== false) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={18} color={colors.text.inverse} />
      <Text style={styles.text}>
        You're offline. Changes will sync when connected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  text: {
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: "500",
  },
});
