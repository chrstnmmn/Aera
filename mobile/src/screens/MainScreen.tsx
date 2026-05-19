import React, { useState } from "react";
// THE FIX: Imported KeyboardAvoidingView
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
} from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";
import SystemMonitor from "../components/ui/SystemMonitor";
import TimerCard from "../components/ui/TimerCard";
import QuickActionCard from "../components/ui/QuickActionCard";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard";

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

	const [activeActionId, setActiveActionId] = useState<string | null>(null);

	const getTitlebarMode = () => {
		if (activeTab === "timer") return "setup";
		return activeTab;
	};

	const quickActions = [
		{
			id: "1",
			title: "Quick Dry",
			time: "20:05",
			subtitle: "min : sec 50°C",
		},
		{
			id: "2",
			title: "Body Towel",
			time: "02:30",
			subtitle: "hr : min 65°C",
		},
		{
			id: "3",
			title: "Cotton Shirt",
			time: "05:00",
			subtitle: "min : sec 55°C",
		},
	];

	const handleActionPress = (id: string) => {
		setActiveActionId((prevId) => (prevId === id ? null : id));
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

			{/* THE FIX: Replaced the standard View wrapper with a KeyboardAvoidingView */}
			<KeyboardAvoidingView
				style={styles.scrollWrapper}
				behavior="height" // 'height' works best on Android to smoothly resize the available space
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					{activeTab === "dashboard" && (
						<View style={styles.page}>
							<SystemMonitor theme={theme} />
							<TimerCard theme={theme} />

							<View style={styles.quickActionsSection}>
								<Text
									style={[
										styles.sectionTitle,
										{ color: theme.text },
									]}
								>
									Quick Actions
								</Text>

								<View style={styles.quickActionsList}>
									{quickActions.map((action) => (
										<QuickActionCard
											key={action.id}
											theme={theme}
											title={action.title}
											time={action.time}
											subtitle={action.subtitle}
											state={
												activeActionId === action.id
													? "power_enabled"
													: "default"
											}
											onCardPress={() =>
												handleActionPress(action.id)
											}
											onPowerPress={() =>
												console.log(
													`Starting ${action.title}...`,
												)
											}
										/>
									))}
								</View>
							</View>
						</View>
					)}

					{activeTab === "timer" && (
						<View style={styles.page}>
							<TimerPickerCard theme={theme} />
							<TemperaturePickerCard theme={theme} />
						</View>
					)}

					{activeTab === "settings" && (
						<View style={styles.page}>
							{/* Settings content goes here */}
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>

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
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 20,
	},
	page: {
		width: "100%",
		alignItems: "center",
		gap: 10,
	},
	quickActionsSection: {
		width: "100%",
		marginTop: 10,
	},
	sectionTitle: {
		fontFamily: "aera_black",
		fontSize: 20,
		marginLeft: 8,
	},
	quickActionsList: {
		gap: 10,
	},
});

export default MainScreen;
