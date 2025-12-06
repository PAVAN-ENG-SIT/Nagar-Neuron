import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface PieChartData {
  name: string;
  value: number;
  color: string;
  legendFontColor?: string;
}

interface PieChartCardProps {
  title: string;
  data: PieChartData[];
}

const screenWidth = Dimensions.get("window").width;

export default function PieChartCard({ title, data }: PieChartCardProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    population: item.value,
    color: item.color,
    legendFontColor: item.legendFontColor || colors.text.secondary,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <PieChart
        data={chartData}
        width={screenWidth - spacing.lg * 2 - spacing.md * 2}
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
