import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";

// 1. THE MISSING PIECE: Define the props interface
interface MainProps {
	theme: any;
	onLogout: () => void;
}

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
	// Navigation State
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "timer" | "settings"
	>("dashboard");

	// Hardware/Telemetry State
	const [deviceStatus] = useState({
		water: 75 as 0 | 25 | 50 | 75 | 100 | null,
		door: "locked" as "locked" | "unlocked" | "inactive",
		uvActive: true,
		wifiLevel: 3 as 1 | 2 | 3 | 4,
		connectionState: "connected" as "connecting" | "connected" | "offline",
	});

	// Helper to map tab names to Titlebar modes
	const getTitlebarMode = () => {
		if (activeTab === "timer") return "setup";
		return activeTab;
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* HEADER SECTION: Stays pinned at the top */}
			<View style={styles.headerContainer}>
				<AeraStatusBar theme={theme} status={deviceStatus} />
				<AeraTitlebar
					mode={getTitlebarMode()}
					theme={theme}
					status={deviceStatus.connectionState}
					onPresetPress={() => console.log("Preset Menu Pressed")}
				/>
			</View>

			{/* CONTENT AREA: This is the only part that scrolls */}
			<View style={styles.scrollWrapper}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{activeTab === "dashboard" && (
						<View style={styles.page}>
							<Text
								style={[
									styles.placeholderText,
									{ color: theme.text },
								]}
							>
								DASHBOARD SCREEN
							</Text>
							{/* These cards help you see the scroll/shadow effect */}
							<View
								style={[
									styles.card,
									{ backgroundColor: theme.barSurface },
								]}
							/>
							<View
								style={[
									styles.card,
									{ backgroundColor: theme.barSurface },
								]}
							/>
						</View>
					)}

					{activeTab === "timer" && (
						<View style={styles.page}>
							<Text
								style={[
									styles.placeholderText,
									{ color: theme.text },
								]}
							>
								TIMER SETUP SCREEN
							</Text>
							<View
								style={[
									styles.card,
									{ backgroundColor: theme.barSurface },
								]}
							/>
						</View>
					)}

					{activeTab === "settings" && (
						<View style={styles.page}>
							<Text
								style={[
									styles.placeholderText,
									{ color: theme.text },
								]}
							>
								SETTINGS SCREEN
							</Text>
							<View
								style={[
									styles.card,
									{ backgroundColor: theme.barSurface },
								]}
							/>
						</View>
					)}
				</ScrollView>
			</View>

			{/* BOTTOM NAVIGATION: Stays pinned at the bottom */}
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
		// Stays out of the ScrollView so it's "Fixed"
		zIndex: 10,
	},
	scrollWrapper: {
		flex: 1, // Layout knows to give this the remaining space
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	page: {
		alignItems: "center",
	},
	placeholderText: {
		fontFamily: "aera_black",
		fontSize: 18,
		letterSpacing: 1,
		marginBottom: 20,
	},
	card: {
		width: "100%",
		height: 300,
		borderRadius: 20,
		marginBottom: 20,
		opacity: 0.3,
	},
});

export default MainScreen;
