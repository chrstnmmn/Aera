import React, { useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import our newly extracted components
import PagerIndicator from "./PagerIndicator";
import WelcomeScreen from "./WelcomeScreen";
import PowerUpScreen from "./PowerUpScreen";

const Setup = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const isDarkMode = useColorScheme() === "dark";

	// Centralized theme passed down to all screens
	const theme = {
		background: isDarkMode ? "#060606" : "#FFFFFF",
		text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
		primaryBlue: "#00A0E9",
		boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
		pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}
		>
			{/* Top Navigation */}
			<PagerIndicator step={currentStep} theme={theme} />

			{/* Screen Router */}
			{currentStep === 0 && (
				<WelcomeScreen theme={theme} onNext={() => setCurrentStep(1)} />
			)}

			{currentStep === 1 && (
				<PowerUpScreen theme={theme} onNext={() => setCurrentStep(2)} />
			)}

			{/* We will add Step 2 & 3 here next! */}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default Setup;
