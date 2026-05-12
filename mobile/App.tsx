import React, { useEffect, useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens
import Setup from "./Setup";
import Dashboard from "./Dashboard";

SplashScreen.preventAutoHideAsync().catch(() => {});

// --- DEV TOGGLE: SET TO TRUE TO BYPASS SETUP ---
const SKIP_SETUP = true;

export default function App() {
  // Initialize state based on our dev toggle
  const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);
  const isDarkMode = useColorScheme() === "dark";

  const theme = {
    background: isDarkMode ? "#060606" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
    primaryBlue: "#00A0E9",
    boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
    pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
  };

  useEffect(() => {
    async function prepare() {
      try {
        // Keeping the splash for brand feel, but it can be shorter if you want
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {isSetupComplete ? (
          <Dashboard theme={theme} onLogout={() => setIsSetupComplete(false)} />
        ) : (
          <Setup onComplete={() => setIsSetupComplete(true)} />
        )}
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
