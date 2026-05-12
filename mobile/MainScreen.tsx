import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import NavigationBar from "./NavigationBar";

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

	return (
		<View style={styles.container}>
			{/* CONTENT AREA: This area changes based on the tab */}
			<View style={styles.content}>
				{activeTab === "dashboard" && (
					<DashboardPlaceholder theme={theme} />
				)}
				{activeTab === "timer" && <TimerPlaceholder theme={theme} />}
				{activeTab === "settings" && (
					<SettingsPlaceholder theme={theme} />
				)}
			</View>

			{/* NAVIGATION BAR: This stays fixed at the bottom */}
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
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default MainScreen;
