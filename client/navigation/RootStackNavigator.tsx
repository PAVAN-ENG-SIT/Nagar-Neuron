import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import UploadScreen from "@/screens/UploadScreen";
import DetailScreen from "@/screens/DetailScreen";
import LoginScreen from "@/screens/LoginScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import BadgesScreen from "@/screens/BadgesScreen";
import VerifyComplaintScreen from "@/screens/VerifyComplaintScreen";
import NearbyUnverifiedScreen from "@/screens/NearbyUnverifiedScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import HotspotsScreen from "@/screens/HotspotsScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import NotificationCenterScreen from "@/screens/NotificationCenterScreen";
import MyComplaintsScreen from "@/screens/MyComplaintsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/lib/auth-context";
import { ActivityIndicator, View } from "react-native";
import { AppColors } from "@/constants/theme";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Upload: undefined;
  Detail: { complaintId: string };
  Leaderboard: undefined;
  Badges: undefined;
  VerifyComplaint: { complaint: any };
  NearbyUnverified: undefined;
  Analytics: undefined;
  Hotspots: undefined;
  Insights: undefined;
  Notifications: undefined;
  MyComplaints: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isLoggedIn ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Upload"
            component={UploadScreen}
            options={{
              presentation: "modal",
              headerTitle: "Report Complaint",
            }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              presentation: "modal",
              headerTitle: "Complaint Details",
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              presentation: "modal",
              headerTitle: "Leaderboard",
            }}
          />
          <Stack.Screen
            name="Badges"
            component={BadgesScreen}
            options={{
              presentation: "modal",
              headerTitle: "Achievements",
            }}
          />
          <Stack.Screen
            name="VerifyComplaint"
            component={VerifyComplaintScreen}
            options={{
              presentation: "modal",
              headerTitle: "Verify Complaint",
            }}
          />
          <Stack.Screen
            name="NearbyUnverified"
            component={NearbyUnverifiedScreen}
            options={{
              presentation: "modal",
              headerTitle: "Nearby Complaints",
            }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              presentation: "modal",
              headerTitle: "Analytics",
            }}
          />
          <Stack.Screen
            name="Hotspots"
            component={HotspotsScreen}
            options={{
              presentation: "modal",
              headerTitle: "Hotspots",
            }}
          />
          <Stack.Screen
            name="Insights"
            component={InsightsScreen}
            options={{
              presentation: "modal",
              headerTitle: "AI Insights",
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationCenterScreen}
            options={{
              presentation: "modal",
              headerTitle: "Notifications",
            }}
          />
          <Stack.Screen
            name="MyComplaints"
            component={MyComplaintsScreen}
            options={{
              presentation: "modal",
              headerTitle: "My Complaints",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
