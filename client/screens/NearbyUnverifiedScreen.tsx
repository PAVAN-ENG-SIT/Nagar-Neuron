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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";

import { colors, spacing, typography, borderRadius, shadows } from "@/constants/theme";
import VerificationBadge from "@/components/Badges/VerificationBadge";
import ConfidenceBadge from "@/components/Badges/ConfidenceBadge";
import FilterBar from "@/components/UI/FilterBar";
import EmptyState from "@/components/UI/EmptyState";
import LoadingSkeleton from "@/components/UI/LoadingSkeleton";

type Complaint = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  distance: string;
  verificationCount: number;
  aiConfidence: number;
  reportedAt: string;
};

const MOCK_NEARBY_COMPLAINTS: Complaint[] = [
  {
    id: "1",
    title: "Large pothole on main road",
    category: "pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400",
    distance: "0.3 km",
    verificationCount: 1,
    aiConfidence: 92,
    reportedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Garbage dump near park",
    category: "garbage",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    distance: "0.5 km",
    verificationCount: 0,
    aiConfidence: 88,
    reportedAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Broken streetlight",
    category: "streetlight",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    distance: "0.8 km",
    verificationCount: 2,
    aiConfidence: 95,
    reportedAt: "1 day ago",
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pothole", label: "Pothole" },
  { key: "garbage", label: "Garbage" },
  { key: "streetlight", label: "Streetlight" },
  { key: "drainage", label: "Drainage" },
];

export default function NearbyUnverifiedScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_NEARBY_COMPLAINTS);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const handleVerify = (complaint: Complaint) => {
    navigation.navigate("VerifyComplaint", { complaint });
  };

  const filteredComplaints =
    selectedFilter === "all"
      ? complaints
      : complaints.filter((c) => c.category === selectedFilter);

  const renderComplaintCard = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVerify(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.distanceBadge}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <VerificationBadge
            count={item.verificationCount}
            required={3}
          />
          <ConfidenceBadge score={item.aiConfidence} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.reportedAt}>{item.reportedAt}</Text>
          <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerify(item)}>
            <MaterialIcons name="verified" size={18} color="#fff" />
            <Text style={styles.verifyButtonText}>{t("verify_now")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton width="100%" height={200} />
          <LoadingSkeleton width="100%" height={200} />
          <LoadingSkeleton width="100%" height={200} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="location-searching" size={24} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t("verify_nearby")}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredComplaints.length} {t("complaints_need_verification")}
            </Text>
          </View>
        </View>
      </View>

      <FilterBar
        options={FILTERS}
        selectedKey={selectedFilter}
        onSelect={setSelectedFilter}
      />

      <FlatList
        data={filteredComplaints}
        renderItem={renderComplaintCard}
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
            icon="checkmark-done"
            title="No complaints to verify"
            message="All nearby complaints have been verified. Check back later!"
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
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    backgroundColor: colors.surface.primary,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.medium,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportedAt: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  verifyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: "#fff",
  },
});
