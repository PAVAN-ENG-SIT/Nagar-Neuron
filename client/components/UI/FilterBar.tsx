import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function FilterBar({
  options,
  selectedKey,
  onSelect,
}: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(option.key)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.text.inverse,
  },
});
