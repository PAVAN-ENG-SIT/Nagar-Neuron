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
import FilterBar from "@/components/UI/FilterBar";
import EmptyState from "@/components/UI/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";

type Complaint = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string;
  location: string;
  createdAt: string;
  verificationCount: number;
  pointsEarned: number;
};

const MOCK_MY_COMPLAINTS: Complaint[] = [
  {
    id: "1",
    title: "Large pothole causing traffic issues",
    category: "pothole",
    status: "in_progress",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400",
    location: "MG Road, Indiranagar",
    createdAt: "Dec 5, 2024",
    verificationCount: 4,
    pointsEarned: 50,
  },
  {
    id: "2",
    title: "Overflowing garbage near park entrance",
    category: "garbage",
    status: "assigned",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    location: "Cubbon Park, Main Gate",
    createdAt: "Dec 4, 2024",
    verificationCount: 2,
    pointsEarned: 30,
  },
  {
    id: "3",
    title: "Broken streetlight on main road",
    category: "streetlight",
    status: "resolved",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    location: "100ft Road, HSR Layout",
    createdAt: "Dec 1, 2024",
    verificationCount: 5,
    pointsEarned: 75,
  },
  {
    id: "4",
    title: "Drainage overflow after rain",
    category: "drainage",
    status: "reported",
    imageUrl: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=400",
    location: "BTM Layout, 2nd Stage",
    createdAt: "Nov 28, 2024",
    verificationCount: 1,
    pointsEarned: 20,
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "reported", label: "Reported" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export default function MyComplaintsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [complaints] = useState<Complaint[]>(MOCK_MY_COMPLAINTS);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const filteredComplaints =
    selectedFilter === "all"
      ? complaints
      : complaints.filter((c) => c.status === selectedFilter);

  const handleComplaintPress = (complaint: Complaint) => {
    navigation.navigate("Detail", { complaintId: complaint.id });
  };

  const getTotalPoints = () => {
    return complaints.reduce((sum, c) => sum + c.pointsEarned, 0);
  };

  const renderComplaintCard = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleComplaintPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <CategoryBadge category={item.category as any} />
          <StatusBadge status={item.status as any} />
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color={colors.text.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{item.createdAt}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="verified" size={14} color={colors.success} />
              <Text style={styles.statText}>{item.verificationCount}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="stars" size={14} color={colors.warning} />
              <Text style={styles.statText}>+{item.pointsEarned}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("my_complaints")}</Text>
          <Text style={styles.subtitle}>
            {complaints.length} complaints submitted
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <MaterialIcons name="stars" size={20} color={colors.warning} />
          <Text style={styles.pointsText}>{getTotalPoints()}</Text>
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
            icon="document-text-outline"
            title="No complaints found"
            message={
              selectedFilter === "all"
                ? "You haven't submitted any complaints yet. Report a civic issue to get started!"
                : `No complaints with status "${selectedFilter}"`
            }
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.warning}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pointsText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.warning,
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
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
});
