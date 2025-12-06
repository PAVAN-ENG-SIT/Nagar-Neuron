import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface LineChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  color?: string;
}

const screenWidth = Dimensions.get("window").width;

export default function LineChartCard({
  title,
  labels,
  data,
  color = colors.primary,
}: LineChartCardProps) {
  const chartData = {
    labels: labels.slice(-7),
    datasets: [
      {
        data: data.length > 0 ? data.slice(-7) : [0],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - spacing.lg * 2 - spacing.md * 2}
        height={180}
        chartConfig={{
          backgroundColor: colors.surface.primary,
          backgroundGradientFrom: colors.surface.primary,
          backgroundGradientTo: colors.surface.primary,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: color,
          },
        }}
        bezier
        style={styles.chart}
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
  chart: {
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
});
