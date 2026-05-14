import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import the icon library components we built
import AeraLogo from "../icons/AeraLogo";
import WaterLevelIcon from "../icons/WaterLevelIcon";
import DoorIcon from "../icons/DoorIcon";
import UVIcon from "../icons/UVIcon";
import WifiIcon from "../icons/WifiIcon";

interface StatusBarProps {
	theme: any;
	status: {
		water: 0 | 25 | 50 | 75 | 100 | null;
		door: "locked" | "unlocked" | "inactive";
		uvActive: boolean;
		wifiLevel: 1 | 2 | 3 | 4;
	};
}

const AeraStatusBar: React.FC<StatusBarProps> = ({ theme, status }) => {
	const insets = useSafeAreaInsets();
	const isDarkMode = theme.background === "#060606";

	// Background and Border logic from Figma
	const barBg = isDarkMode ? "#141414" : "#E7E7E7";

	return (
		<View
			style={[
				styles.outerContainer,
				{
					backgroundColor: barBg,
					paddingTop: insets.top, // Handles Notch/Dynamic Island
				},
				isDarkMode ? styles.darkBorder : styles.lightShadow,
			]}
		>
			<View style={styles.innerContent}>
				{/* LEFT: Brand Identity */}
				<AeraLogo theme={theme} />

				{/* RIGHT: Telemetry Group (gap: 13 from Figma) */}
				<View style={styles.statusGroup}>
					<WaterLevelIcon theme={theme} percentage={status.water} />

					<View style={styles.iconSeparator}>
						<DoorIcon theme={theme} status={status.door} />
					</View>

					<View style={styles.iconSeparator}>
						<UVIcon theme={theme} isActive={status.uvActive} />
					</View>

					<View style={styles.iconSeparator}>
						<WifiIcon theme={theme} level={status.wifiLevel} />
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	outerContainer: {
		width: "100%",
		zIndex: 10,
	},
	innerContent: {
		height: 56, // Matches the 55.52 height in Figma
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 17, // Matches 'left: 17' in Figma
	},
	statusGroup: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
	},
	iconSeparator: {
		marginLeft: 13, // Matches 'gap: 13' in Figma status group
	},
	lightShadow: {
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.3,
				shadowRadius: 3,
			},
			android: {
				elevation: 10,
			},
		}),
	},
	darkBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "rgba(217, 217, 217, 0.50)", // Matches Figma Darkmode border
	},
});

export default AeraStatusBar;
