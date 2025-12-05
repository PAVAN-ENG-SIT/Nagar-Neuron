import React, { useState, useCallback, lazy, Suspense } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Complaint } from "@shared/schema";
import { ThemedText } from "@/components/ThemedText";

let MapViewComponent: any = null;
let MarkerComponent: any = null;
let CalloutComponent: any = null;

if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapViewComponent = maps.default;
    MarkerComponent = maps.Marker;
    CalloutComponent = maps.Callout;
  } catch (e) {
    console.log("react-native-maps not available");
  }
}

const BANGALORE_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const categoryColors: Record<string, string> = {
  pothole: AppColors.categoryPothole,
  garbage: AppColors.categoryGarbage,
  streetlight: AppColors.categoryStreetlight,
  drainage: AppColors.categoryDrainage,
  other: AppColors.categoryOther,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const handleMarkerPress = useCallback((complaintId: string) => {
    navigation.navigate("Detail", { complaintId });
  }, [navigation]);

  if (Platform.OS === "web" || !MapViewComponent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.webFallback, { paddingTop: insets.top + 60 }]}>
          <ThemedText type="h3" style={styles.webTitle}>
            Map View
          </ThemedText>
          <ThemedText type="body" style={[styles.webSubtitle, { color: theme.textSecondary }]}>
            Run in Expo Go to view the interactive map with complaint locations
          </ThemedText>
          <View style={styles.legendContainer}>
            <ThemedText type="h4" style={styles.legendTitle}>
              Legend
            </ThemedText>
            {Object.entries(categoryColors).map(([category, color]) => (
              <View key={category} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
            ))}
          </View>
          <ThemedText type="small" style={[styles.complaintCount, { color: theme.textSecondary }]}>
            {complaints.length} complaints in Bangalore
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <MapViewComponent
          style={styles.map}
          initialRegion={BANGALORE_REGION}
          showsUserLocation
          showsMyLocationButton
        >
          {complaints.map((complaint) => (
            <MarkerComponent
              key={complaint.id}
              coordinate={{
                latitude: complaint.latitude,
                longitude: complaint.longitude,
              }}
              pinColor={categoryColors[complaint.category] || AppColors.categoryOther}
              onCalloutPress={() => handleMarkerPress(complaint.id)}
            >
              <CalloutComponent tooltip>
                <View style={[styles.callout, { backgroundColor: theme.cardBackground }]}>
                  <Text style={[styles.calloutCategory, { color: categoryColors[complaint.category] }]}>
                    {complaint.category.toUpperCase()}
                  </Text>
                  <Text style={[styles.calloutLocation, { color: theme.text }]} numberOfLines={2}>
                    {complaint.location}
                  </Text>
                  <Text style={[styles.calloutStatus, { color: theme.textSecondary }]}>
                    {complaint.status}
                  </Text>
                  <Text style={[styles.calloutAction, { color: AppColors.primary }]}>
                    Tap to view details
                  </Text>
                </View>
              </CalloutComponent>
            </MarkerComponent>
          ))}
        </MapViewComponent>
      )}
      <View style={[styles.legend, { backgroundColor: theme.cardBackground, bottom: insets.bottom + 100 }]}>
        {Object.entries(categoryColors).map(([category, color]) => (
          <View key={category} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  legend: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    opacity: 0.95,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  callout: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    minWidth: 180,
    maxWidth: 250,
  },
  calloutCategory: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  calloutLocation: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  calloutStatus: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  calloutAction: {
    fontSize: 12,
    fontWeight: "600",
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  webTitle: {
    marginBottom: Spacing.sm,
  },
  webSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  legendContainer: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  legendTitle: {
    marginBottom: Spacing.sm,
  },
  complaintCount: {
    marginTop: Spacing.lg,
  },
});
