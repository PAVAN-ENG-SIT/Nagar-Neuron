import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery, useMutation } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { apiRequest, queryClient, getApiUrl } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Complaint, ComplaintStatus } from "@shared/schema";

const STATUSES: ComplaintStatus[] = ["Reported", "Assigned", "In Progress", "Resolved"];

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, "Detail">>();
  const { complaintId } = route.params;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | null>(null);
  const [updateNotes, setUpdateNotes] = useState("");

  const { data: complaint, isLoading, error } = useQuery<Complaint>({
    queryKey: ["/api/complaints", complaintId],
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStatus) throw new Error("Please select a status");
      const response = await apiRequest("PUT", `/api/complaints/${complaintId}/status`, {
        status: selectedStatus,
        notes: updateNotes.trim() || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      Alert.alert("Success", "Complaint status has been updated.");
      setSelectedStatus(null);
      setUpdateNotes("");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update status.");
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (error || !complaint) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundRoot }]}>
        <MaterialIcons name="error-outline" size={64} color={theme.textMuted} />
        <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
          Complaint Not Found
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          The complaint you're looking for doesn't exist.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${complaint.image}` }}
        style={styles.heroImage}
        contentFit="cover"
      />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Complaint ID
            </ThemedText>
            <ThemedText type="h4">{complaint.id}</ThemedText>
          </View>
          <View style={styles.badgeRow}>
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardRow}>
            <MaterialIcons name="location-on" size={20} color={AppColors.primary} />
            <View style={styles.cardRowContent}>
              <ThemedText type="body">{complaint.location}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={styles.cardTitle}>
            AI Analysis
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {complaint.description}
          </ThemedText>
          {complaint.notes ? (
            <>
              <ThemedText type="h4" style={[styles.cardTitle, { marginTop: Spacing.lg }]}>
                Additional Notes
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {complaint.notes}
              </ThemedText>
            </>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Timeline
          </ThemedText>
          <View style={styles.cardRow}>
            <MaterialIcons name="schedule" size={18} color={theme.textMuted} />
            <View style={styles.cardRowContent}>
              <ThemedText type="small">Created</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {formatDate(complaint.createdAt)}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.cardRow, { marginTop: Spacing.md }]}>
            <MaterialIcons name="update" size={18} color={theme.textMuted} />
            <View style={styles.cardRowContent}>
              <ThemedText type="small">Last Updated</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {getRelativeTime(complaint.updatedAt)}
              </ThemedText>
            </View>
          </View>
        </View>

        {complaint.statusHistory.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Status History
            </ThemedText>
            <View style={styles.timeline}>
              {complaint.statusHistory.map((entry, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    <View
                      style={[
                        styles.timelineDotInner,
                        { backgroundColor: getStatusColor(entry.status) },
                      ]}
                    />
                    {index < complaint.statusHistory.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <StatusBadge status={entry.status} />
                    <ThemedText type="caption" style={{ color: theme.textMuted, marginTop: Spacing.xs }}>
                      {formatDate(entry.timestamp)}
                    </ThemedText>
                    {entry.notes ? (
                      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                        {entry.notes}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Update Status
          </ThemedText>
          <View style={styles.statusPicker}>
            {STATUSES.map((status) => (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={({ pressed }) => [
                  styles.statusOption,
                  {
                    backgroundColor:
                      selectedStatus === status
                        ? getStatusColor(status) + "30"
                        : theme.backgroundSecondary,
                    borderColor:
                      selectedStatus === status ? getStatusColor(status) : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: selectedStatus === status ? getStatusColor(status) : theme.text,
                    fontWeight: selectedStatus === status ? "600" : "400",
                  }}
                >
                  {status}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Add notes about this update..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={updateNotes}
            onChangeText={setUpdateNotes}
          />
          <Pressable
            onPress={() => updateMutation.mutate()}
            disabled={!selectedStatus || updateMutation.isPending}
            style={({ pressed }) => [
              styles.updateButton,
              {
                backgroundColor:
                  !selectedStatus || updateMutation.isPending
                    ? theme.textMuted
                    : AppColors.primary,
                opacity: pressed && selectedStatus ? 0.8 : 1,
              },
            ]}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="body" style={styles.updateButtonText}>
                Update Status
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Reported: AppColors.warning,
    Assigned: AppColors.primary,
    "In Progress": "#f97316",
    Resolved: AppColors.success,
  };
  return colors[status] || AppColors.categoryOther;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  cardRowContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  timeline: {
    gap: Spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  timelineDot: {
    alignItems: "center",
    width: 20,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
    minHeight: 30,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  statusPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  updateButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
