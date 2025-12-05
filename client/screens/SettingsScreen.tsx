import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface SettingsItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  theme: any;
}

function SettingsItem({ icon, title, subtitle, onPress, showArrow = true, theme }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: theme.cardBackground, opacity: pressed && onPress ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.settingsIconContainer, { backgroundColor: AppColors.primary + "20" }]}>
        <MaterialIcons name={icon} size={22} color={AppColors.primary} />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText type="body">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {showArrow && onPress ? (
        <MaterialIcons name="chevron-right" size={24} color={theme.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handlePrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "NagarNeuron collects location data and images only when you submit complaints. Your data is used solely to report civic issues to local authorities. We do not share your personal information with third parties.",
      [{ text: "OK" }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      "Terms of Service",
      "By using NagarNeuron, you agree to submit accurate and genuine civic complaints. Misuse of the platform, including false reports, may result in account restrictions. All complaints are subject to review by civic authorities.",
      [{ text: "OK" }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      "Contact Support",
      "For support, please email us at support@nagarneuron.app\n\nWe typically respond within 24-48 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: () => {
            Linking.openURL("mailto:support@nagarneuron.app?subject=NagarNeuron Support Request");
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About NagarNeuron",
      "NagarNeuron is an AI-powered civic complaint management platform designed to make reporting infrastructure issues quick and easy.\n\nOur AI automatically categorizes your complaints and routes them to the appropriate authorities for faster resolution.\n\nBuilt with care for Bangalore citizens.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl + Spacing.fabSize,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.header}>
        <View style={[styles.appIconContainer, { backgroundColor: AppColors.primary }]}>
          <MaterialIcons name="share-location" size={40} color="#FFFFFF" />
        </View>
        <ThemedText type="h3" style={styles.appName}>
          NagarNeuron
        </ThemedText>
        <ThemedText type="small" style={[styles.appTagline, { color: theme.textSecondary }]}>
          AI-Powered Civic Complaint Management
        </ThemedText>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        App Information
      </ThemedText>
      <View style={styles.settingsGroup}>
        <SettingsItem
          icon="info"
          title="About"
          subtitle="Learn more about NagarNeuron"
          onPress={handleAbout}
          theme={theme}
        />
        <SettingsItem
          icon="new-releases"
          title="Version"
          subtitle={appVersion}
          showArrow={false}
          theme={theme}
        />
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Legal
      </ThemedText>
      <View style={styles.settingsGroup}>
        <SettingsItem
          icon="privacy-tip"
          title="Privacy Policy"
          onPress={handlePrivacyPolicy}
          theme={theme}
        />
        <SettingsItem
          icon="description"
          title="Terms of Service"
          onPress={handleTerms}
          theme={theme}
        />
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Support
      </ThemedText>
      <View style={styles.settingsGroup}>
        <SettingsItem
          icon="email"
          title="Contact Us"
          subtitle="Get help or send feedback"
          onPress={handleContact}
          theme={theme}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: "center" }}>
          Made with care for Bangalore
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: "center" }}>
          NagarNeuron Hackathon Demo
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  appTagline: {
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  settingsGroup: {
    gap: Spacing.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.small,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  footer: {
    marginTop: Spacing["3xl"],
    gap: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
});
