import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, useColorScheme, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

// Screens
import Setup from "./Setup";
import MainScreen from "./MainScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SKIP_SETUP = false;

export default function App() {
	const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);
	const isDarkMode = useColorScheme() === "dark";

	// --- 1. FONT LOADING (Static Only) ---
	const [fontsLoaded, fontError] = useFonts({
  "aera_black": require("./assets/fonts/aera_black.ttf"),
  "aera_heavy": require("./assets/fonts/aera_heavy.ttf"),
  "aera_bold": require("./assets/fonts/aera_bold.ttf"),
  "aera_medium": require("./assets/fonts/aera_medium.ttf"),
  "aera_regular": require("./assets/fonts/aera_regular.ttf"),
});
	// --- 2. THEME CONFIGURATION ---
	const barSurfaceColor = isDarkMode ? "#141414" : "#E7E7E7";

	const theme = {
		background: isDarkMode ? "#060606" : "#FFFFFF",
		text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
		primaryBlue: isDarkMode ? "#1CA7ED" : "#1497D9",
		boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
		pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
		barSurface: barSurfaceColor,
	};

	// --- 3. ANDROID SYSTEM UI SYNC (With Bridge Delay) ---
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		async function syncSystemBars() {
			if (Platform.OS === "android") {
				try {
					// 1. Force the OS bar to be invisible glass
					await NavigationBar.setBackgroundColorAsync("#00000000");

					// 2. Float it over the app so it never steals physical screen space
					await NavigationBar.setPositionAsync("absolute");

					// 3. Hide the soft keys entirely
					await NavigationBar.setVisibilityAsync("hidden");

					// 4. Allow temporary swipe-up access (standard for immersive apps)
					await NavigationBar.setBehaviorAsync("overlay-swipe");
				} catch (error) {
					console.warn("Failed to set navigation bar state", error);
				}
			}
		}

		timeoutId = setTimeout(syncSystemBars, 150);
		return () => clearTimeout(timeoutId);
	}, []);

	// --- 4. SPLASH SCREEN LOGIC ---
	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded || fontError) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<View
				style={[
					styles.container,
					{ backgroundColor: theme.background },
				]}
				onLayout={onLayoutRootView}
			>
				<StatusBar
					style={isDarkMode ? "light" : "dark"}
					// If in MainScreen, use the bar surface color. If in Setup, use the deep background color.
					backgroundColor={
						isSetupComplete ? theme.barSurface : theme.background
					}
					translucent={false}
				/>

				{isSetupComplete ? (
					<MainScreen
						theme={theme}
						onLogout={() => setIsSetupComplete(false)}
					/>
				) : (
					<Setup
						theme={theme}
						onComplete={() => setIsSetupComplete(true)}
					/>
				)}
			</View>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
