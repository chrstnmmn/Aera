import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import NavigationBar from "./NavigationBar";
import AeraStatusBar from "./AeraStatusBar"; // Import our new Status Bar

// Temporary lightweight layouts
const DashboardPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={{ color: theme.text, fontWeight: "800" }}>
			DASHBOARD SCREEN
		</Text>
	</View>
);
const TimerPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={{ color: theme.text, fontWeight: "800" }}>
			TIMER SETUP SCREEN
		</Text>
	</View>
);
const SettingsPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={{ color: theme.text, fontWeight: "800" }}>
			SETTINGS SCREEN
		</Text>
	</View>
);

interface MainProps {
	theme: any;
	onLogout: () => void;
}

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "timer" | "settings"
	>("dashboard");

	// --- TELEMETRY STATE ---
	// This is where your ESP32 data will eventually be stored
	const [deviceStatus, setDeviceStatus] = useState({
		water: 0 as 0 | 25 | 50 | 75 | 100 | null,
		door: "locked" as "locked" | "unlocked" | "inactive",
		uvActive: false,
		wifiLevel: 1 as 1 | 2 | 3 | 4,
	});

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* 1. STATUS BAR: Fixed at the top */}
			<AeraStatusBar theme={theme} status={deviceStatus} />

			{/* 2. CONTENT AREA: Changes based on tab */}
			<View style={styles.content}>
				{activeTab === "dashboard" && (
					<DashboardPlaceholder theme={theme} />
				)}
				{activeTab === "timer" && <TimerPlaceholder theme={theme} />}
				{activeTab === "settings" && (
					<SettingsPlaceholder theme={theme} />
				)}
			</View>

			{/* 3. NAVIGATION BAR: Fixed at the bottom */}
			<NavigationBar
				theme={theme}
				activeTab={activeTab}
				onTabChange={(tab) => setActiveTab(tab)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1, // Takes up all remaining space between status bar and nav bar
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default MainScreen;
