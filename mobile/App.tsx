import React, { useEffect, useCallback } from "react";
import { StyleSheet, View, useColorScheme, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

// Import your two environments
import MainApp from "./src/navigation/MainApp";
import Preview from "./src/navigation/Preview";

SplashScreen.preventAutoHideAsync().catch(() => {});

const USE_PREVIEW_MODE = false;

export default function App() {
	const isDarkMode = useColorScheme() === "dark";

	// --- 1. FONT LOADING ---
	const [fontsLoaded, fontError] = useFonts({
		aera_black: require("./assets/fonts/aera_black.ttf"),
		aera_heavy: require("./assets/fonts/aera_heavy.ttf"),
		aera_bold: require("./assets/fonts/aera_bold.ttf"),
		aera_medium: require("./assets/fonts/aera_medium.ttf"),
		aera_regular: require("./assets/fonts/aera_regular.ttf"),
		aera_semibold: require("./assets/fonts/aera_semibold.ttf"),
		aera_small: require("./assets/fonts/aera_small.ttf"),
		aera_tiny: require("./assets/fonts/aera_tiny.ttf"),
		aera_tallmedium: require("./assets/fonts/aera_tallmedium.ttf"),
		aera_tallsmall: require("./assets/fonts/aera_tallsmall.ttf"),
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

	// --- 3. ANDROID SYSTEM UI SYNC ---
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		async function syncSystemBars() {
			if (Platform.OS === "android") {
				try {
					await NavigationBar.setBackgroundColorAsync("#00000000");
					await NavigationBar.setPositionAsync("absolute");
					await NavigationBar.setVisibilityAsync("hidden");
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
					backgroundColor={theme.background}
					translucent={false}
				/>

				{/* --- ENVIRONMENT ROUTER --- */}
				{USE_PREVIEW_MODE ? (
					<Preview theme={theme} />
				) : (
					<MainApp theme={theme} />
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
