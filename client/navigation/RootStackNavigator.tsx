import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import UploadScreen from "@/screens/UploadScreen";
import DetailScreen from "@/screens/DetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  Upload: undefined;
  Detail: { complaintId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
    </Stack.Navigator>
  );
}
