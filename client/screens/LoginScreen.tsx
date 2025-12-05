import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/Button";
import { AppColors, Spacing, Typography, Shadows, BorderRadius } from "@/constants/theme";

let LinearGradientComponent: any = View;
try {
  if (Platform.OS !== "web") {
    const gradient = require("expo-linear-gradient");
    LinearGradientComponent = gradient.LinearGradient;
  }
} catch (e) {
  console.log("expo-linear-gradient not available");
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      await login(phone, name || undefined);
    } catch (error) {
      Alert.alert("Login Failed", "Unable to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = Platform.OS === "web"
    ? [styles.container, { backgroundColor: AppColors.primary }]
    : styles.container;

  const gradientProps = Platform.OS !== "web"
    ? { colors: [AppColors.primary, "#1a3a5c"] }
    : {};

  return (
    <LinearGradientComponent
      {...gradientProps}
      style={containerStyle}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="location-city" size={60} color={AppColors.primary} />
          </View>
          <Text style={styles.title}>NagarNeuron</Text>
          <Text style={styles.subtitle}>AI-Powered Civic Management</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.instructionText}>
            Enter your phone number to get started
          </Text>

          <View style={styles.inputGroup}>
            <MaterialIcons name="phone" size={22} color={AppColors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={AppColors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={22} color={AppColors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your Name (optional)"
              placeholderTextColor={AppColors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <Button
            title={isLoading ? "Logging in..." : "Continue"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          />

          {isLoading && (
            <ActivityIndicator
              size="small"
              color={AppColors.primary}
              style={{ marginTop: Spacing.md }}
            />
          )}
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <MaterialIcons name="photo-camera" size={24} color="#fff" />
            <Text style={styles.featureText}>Report Issues</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="verified" size={24} color="#fff" />
            <Text style={styles.featureText}>AI Classification</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="emoji-events" size={24} color="#fff" />
            <Text style={styles.featureText}>Earn Points</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradientComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.large,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.large,
  },
  welcomeText: {
    ...Typography.h2,
    color: AppColors.textPrimary,
    textAlign: "center",
  },
  instructionText: {
    ...Typography.body,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.backgroundMuted,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: AppColors.textPrimary,
  },
  button: {
    marginTop: Spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.xxl,
  },
  featureItem: {
    alignItems: "center",
  },
  featureText: {
    color: "rgba(255,255,255,0.9)",
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
});
