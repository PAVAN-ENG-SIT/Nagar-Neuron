import { Platform } from "react-native";

export const AppColors = {
  primary: "#3b82f6",
  primaryDark: "#1e40af",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  
  categoryPothole: "#ef4444",
  categoryGarbage: "#10b981",
  categoryStreetlight: "#fbbf24",
  categoryDrainage: "#3b82f6",
  categoryOther: "#6b7280",
  
  statusReportedBg: "#fef3c7",
  statusReportedText: "#92400e",
  statusAssignedBg: "#dbeafe",
  statusAssignedText: "#1e40af",
  statusInProgressBg: "#fed7aa",
  statusInProgressText: "#9a3412",
  statusResolvedBg: "#d1fae5",
  statusResolvedText: "#065f46",
};

const tintColorLight = AppColors.primary;
const tintColorDark = "#60a5fa";

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6b7280",
    tabIconSelected: tintColorLight,
    link: AppColors.primary,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#f9fafb",
    backgroundSecondary: "#f3f4f6",
    backgroundTertiary: "#e5e7eb",
    border: "#e5e7eb",
    cardBackground: "#FFFFFF",
  },
  dark: {
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6b7280",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    backgroundRoot: "#111827",
    backgroundDefault: "#1f2937",
    backgroundSecondary: "#374151",
    backgroundTertiary: "#4b5563",
    border: "#374151",
    cardBackground: "#1f2937",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 52,
  fabSize: 64,
  fabOffset: 32,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
