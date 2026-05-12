import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font"; // <--- Added

// Screens
import Setup from "./Setup";
import MainScreen from "./MainScreen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

const SKIP_SETUP = false;

export default function App() {
	const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);
	const isDarkMode = useColorScheme() === "dark";

	// --- FONT LOADING ---
	const [fontsLoaded, fontError] = useFonts({
		// Sliced Variable Instances
		// Static Weights
		"SFPro-Black": require("./assets/fonts/Black.ttf"),
		"SFPro-Heavy": require("./assets/fonts/Heavy.ttf"),
		"SFPro-Bold": require("./assets/fonts/Bold.ttf"),
		"SFPro-Medium": require("./assets/fonts/Medium.ttf"),
		"SFPro-Regular": require("./assets/fonts/Regular.ttf"),
	});

	const theme = {
		background: isDarkMode ? "#060606" : "#FFFFFF",
		text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
		primaryBlue: isDarkMode ? "#1CA7ED" : "#1497D9",
		boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
		pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
	};

	// --- SPLASH SCREEN LOGIC ---
	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded || fontError) {
			// Hide the splash screen once fonts are ready
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	// Guard clause: Don't render UI until fonts are ready
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
				onLayout={onLayoutRootView} // <--- Triggered when View mounts
			>
				{isSetupComplete ? (
					<MainScreen
						theme={theme}
						onLogout={() => setIsSetupComplete(false)}
					/>
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
