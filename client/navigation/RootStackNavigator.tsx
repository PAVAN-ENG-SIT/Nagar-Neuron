import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import UploadScreen from "@/screens/UploadScreen";
import DetailScreen from "@/screens/DetailScreen";
import LoginScreen from "@/screens/LoginScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import BadgesScreen from "@/screens/BadgesScreen";
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
        </>
      )}
    </Stack.Navigator>
  );
}
