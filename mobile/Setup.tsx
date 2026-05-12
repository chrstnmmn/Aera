import React, { useState } from "react";
import {
	StyleSheet,
	useColorScheme,
	View,
	TouchableOpacity,
	Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Screens & Components
import PagerIndicator from "./PagerIndicator";
import WelcomeScreen from "./WelcomeScreen";
import PowerUpScreen from "./PowerUpScreen";
import BluetoothScreen from "./BluetoothScreen";
import WifiSetupScreen from "./WifiSetupScreen";
import SuccessScreen from "./SuccessScreen";
import GoBackIcon from "./GoBackIcon";

interface SetupProps {
	theme: any;
	onComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
	const [currentStep, setCurrentStep] = useState(0);
	const isDarkMode = useColorScheme() === "dark";

	// Merging your local setup theme with dynamic colors
	const theme = {
		background: isDarkMode ? "#060606" : "#FFFFFF",
		text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
		primaryBlue: "#00A0E9",
		boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
		pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
	};

	const handleBack = () => {
		if (currentStep > 0) setCurrentStep(currentStep - 1);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}
		>
			<View style={styles.headerContainer}>
				{currentStep > 0 && currentStep < 4 && (
					<TouchableOpacity
						style={styles.backBtn}
						onPress={handleBack}
					>
						<GoBackIcon fill={theme.text} />
						<Text
							style={[styles.backBtnText, { color: theme.text }]}
						>
							{currentStep === 3 ? "Cancel" : "Go Back"}
						</Text>
					</TouchableOpacity>
				)}
				<PagerIndicator
					step={currentStep}
					theme={theme}
					totalSteps={5}
				/>
			</View>

			<View style={styles.screenContainer}>
				{currentStep === 0 && (
					<WelcomeScreen
						theme={theme}
						onNext={() => setCurrentStep(1)}
					/>
				)}
				{currentStep === 1 && (
					<PowerUpScreen
						theme={theme}
						onNext={() => setCurrentStep(2)}
					/>
				)}
				{currentStep === 2 && (
					<BluetoothScreen
						theme={theme}
						onNext={() => setCurrentStep(3)}
					/>
				)}
				{currentStep === 3 && (
					<WifiSetupScreen
						theme={theme}
						onNext={() => setCurrentStep(4)}
					/>
				)}
				{currentStep === 4 && (
					<SuccessScreen theme={theme} onFinish={onComplete} />
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	headerContainer: {
		height: 60,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
	},
	backBtn: {
		position: "absolute",
		left: 20,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	backBtnText: { fontSize: 18, fontWeight: "700", fontFamily: "SFPro-Bold" },
	screenContainer: { flex: 1 },
});

export default Setup;
