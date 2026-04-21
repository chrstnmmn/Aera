import React, { useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	useColorScheme,
	ScrollView,
	Dimensions,
	TouchableOpacity,
} from "react-native";
import LogoDark from "./assets/header-logo-dark.svg";
import LogoLight from "./assets/header-logo-light.svg";

const { width } = Dimensions.get("window");

const Setup = () => {
	const isDarkMode = useColorScheme() === "dark";
	const [isBluetoothOn, setIsBluetoothOn] = useState(true);
	const theme = {
		text: isDarkMode ? "#E7E7E7" : "#2E2E2E",
		subtext: isDarkMode ? "#E7E7E7" : "#2E2E2E",
		background: isDarkMode ? "#060606" : "#FFFFFF",
		buttonBg: isDarkMode ? "#141414" : "#E7E7E7",
		buttonText: isDarkMode ? "#E7E7E7" : "#2E2E2E",
		buttonBorder: isDarkMode ? "rgba(217, 217, 217, 0.5)" : "transparent",
		borderWidth: isDarkMode ? 1 : 0,
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* 1. Centered Logo */}
				<View style={styles.logoContainer}>
					{isDarkMode ? (
						<LogoDark width={width * 0.6} height={150} />
					) : (
						<LogoLight width={width * 0.6} height={150} />
					)}
				</View>

				{/* 2. Instructions Container */}
				<View style={styles.instructionsContainer}>
					<Text style={[styles.mainTitle, { color: theme.text }]}>
						How to connect the Aera Dryer to the App:
					</Text>

					<View style={styles.stepBox}>
						<Text style={[styles.stepTitle, { color: theme.text }]}>
							Step 1: Power & Pair
						</Text>
						<Text
							style={[
								styles.stepDescription,
								{ color: theme.subtext },
							]}
						>
							Power on your Aera Nano hardware and ensure
							Bluetooth and Wi-Fi are enabled on your smartphone.
							Select your dryer from the discovered devices list
							to initiate the Bluetooth pairing.
						</Text>
					</View>

					<View style={styles.stepBox}>
						<Text style={[styles.stepTitle, { color: theme.text }]}>
							Step 2: Wi-Fi Details
						</Text>
						<Text
							style={[
								styles.stepDescription,
								{ color: theme.subtext },
							]}
						>
							Select your local 2.4GHz Wi-Fi network from the list
							and enter the password. This information is sent
							securely to the Aera Dryer over the Bluetooth
							bridge.
						</Text>
					</View>

					<View style={styles.stepBox}>
						<Text style={[styles.stepTitle, { color: theme.text }]}>
							Step 3: Provisioning
						</Text>
						<Text
							style={[
								styles.stepDescription,
								{ color: theme.subtext },
							]}
						>
							The app will send the credentials to the Aera Dryer,
							which will automatically save them and join the
							network. This process may take a minute.
						</Text>
					</View>

					<Text style={[styles.finalCheck, { color: theme.text }]}>
						Final Check: The app confirms a successful connection.
						Ensure your phone and the Aera Dryer are on the same
						Wi-Fi network to begin live telemetry.
					</Text>

					<View style={styles.buttonWrapper}>
						<TouchableOpacity
							style={[
								styles.connectButton,
								{
									backgroundColor: theme.buttonBg,
									borderColor: theme.buttonBorder,
									borderWidth: theme.borderWidth,
								},
							]}
							activeOpacity={0.8}
						>
							<Text
								style={[
									styles.connectText,
									{ color: theme.buttonText },
								]}
							>
								Connect
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.bluetoothStatusWrapper}>
						<Text
							style={[
								styles.bluetoothStatus,
								{ color: theme.text },
							]}
						>
							{/* If isBluetoothOn is true, show "On", otherwise show "Off" */}
							Bluetooth Status: {isBluetoothOn ? "On" : "Off"}
						</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { paddingHorizontal: 20, paddingTop: 90, paddingBottom: 40 },
	logoContainer: { alignItems: "center", marginBottom: 20 },
	instructionsContainer: { width: "100%" },
	mainTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 25,
		lineHeight: 28,
	},
	stepBox: { marginBottom: 10 },
	stepTitle: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
	stepDescription: { fontSize: 14, lineHeight: 20 },
	finalCheck: {
		fontSize: 12,
		marginTop: 10,
		fontWeight: "600",
		fontStyle: "italic",
	},
	buttonWrapper: {
		alignItems: "center",
		marginTop: 35,
		marginBottom: 8,
	},
	connectButton: {
		width: 175,
		height: 39,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",

		// iOS Shadows
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 6,

		// Android Shadow
		elevation: 6,
	},
	connectText: {
		fontSize: 20,
		fontWeight: "700", // Matches the "Bold" look in your Figma
	},
	bluetoothStatusWrapper: {
		alignItems: "center",
	},
	bluetoothStatus: {
		fontSize: 14,
	},
});

export default Setup;
