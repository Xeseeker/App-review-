import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";

export default function Layout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then((status) => {
        console.log("AdMob initialized successfully:", status);
      })
      .catch((error) => {
        console.warn("AdMob initialization failed:", error);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f8fafc" },
          headerTintColor: "#172033",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Appora" }} />
        <Stack.Screen name="search" options={{ title: "Search by code" }} />
        <Stack.Screen name="categories" options={{ title: "Categories" }} />
        <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen
          name="app-details/[id]"
          options={{ title: "App details" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
