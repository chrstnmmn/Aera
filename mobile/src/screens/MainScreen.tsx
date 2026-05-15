import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";
import SystemMonitor from "../components/ui/SystemMonitor";
import TimerCard from "../components/ui/TimerCard"; // <-- Imported TimerCard

interface MainProps {
	theme: any;
	onLogout: () => void;
}

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "timer" | "settings"
	>("dashboard");

	const [deviceStatus] = useState({
		water: 75 as 0 | 25 | 50 | 75 | 100 | null,
		door: "locked" as "locked" | "unlocked" | "inactive",
		uvActive: true,
		wifiLevel: 3 as 1 | 2 | 3 | 4,
		connectionState: "connected" as "connecting" | "connected" | "offline",
	});

	const getTitlebarMode = () => {
		if (activeTab === "timer") return "setup";
		return activeTab;
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* HEADER SECTION */}
			<View style={styles.headerContainer}>
				<AeraStatusBar theme={theme} status={deviceStatus} />
				<AeraTitlebar
					mode={getTitlebarMode()}
					theme={theme}
					status={deviceStatus.connectionState}
					onPresetPress={() => console.log("Preset Menu Pressed")}
				/>
			</View>

			{/* CONTENT AREA */}
			<View style={styles.scrollWrapper}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{activeTab === "dashboard" && (
						<View style={styles.page}>
							{/* THE SYSTEM MONITOR INTEGRATION */}
							<SystemMonitor theme={theme} />

							{/* THE TIMER CARD INTEGRATION */}
							<TimerCard theme={theme} />
						</View>
					)}

					{activeTab === "timer" && (
						<View style={styles.page}>
							{/* Timer content goes here */}
						</View>
					)}

					{activeTab === "settings" && (
						<View style={styles.page}>
							{/* Settings content goes here */}
						</View>
					)}
				</ScrollView>
			</View>

			{/* BOTTOM NAVIGATION */}
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
	headerContainer: {
		zIndex: 10,
	},
	scrollWrapper: {
		flex: 1,
	},
	scrollContent: {
		// Horizontal padding provides space for the card shadows
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 20,
	},
	page: {
		width: "100%",
		alignItems: "center",
		gap: 10, // <-- Creates the uniform spacing between your stacked dashboard cards
	},
});

export default MainScreen;
