import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import NavigationBar from "./NavigationBar";
import AeraStatusBar from "./AeraStatusBar";

const DashboardPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={[styles.placeholderText, { color: theme.text }]}>
			DASHBOARD SCREEN
		</Text>
	</View>
);

const TimerPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={[styles.placeholderText, { color: theme.text }]}>
			TIMER SETUP SCREEN
		</Text>
	</View>
);

const SettingsPlaceholder = ({ theme }: any) => (
	<View style={styles.center}>
		<Text style={[styles.placeholderText, { color: theme.text }]}>
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

	const [deviceStatus, setDeviceStatus] = useState({
		water: 75 as 0 | 25 | 50 | 75 | 100 | null,
		door: "locked" as "locked" | "unlocked" | "inactive",
		uvActive: true,
		wifiLevel: 3 as 1 | 2 | 3 | 4,
	});

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<AeraStatusBar theme={theme} status={deviceStatus} />

			<View style={styles.content}>
				{activeTab === "dashboard" && (
					<DashboardPlaceholder theme={theme} />
				)}
				{activeTab === "timer" && <TimerPlaceholder theme={theme} />}
				{activeTab === "settings" && (
					<SettingsPlaceholder theme={theme} />
				)}
			</View>

			<NavigationBar
				theme={theme}
				activeTab={activeTab}
				onTabChange={(tab: any) => setActiveTab(tab)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	placeholderText: {
		fontFamily: "aera_black",
		fontSize: 18,
		letterSpacing: 1,
	},
});

export default MainScreen;
