import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard"; // Import the new component

export default function Preview({ theme }: { theme: any }) {
	return (
		<ScrollView
			contentContainerStyle={[
				styles.content,
				{ backgroundColor: theme.background },
			]}
			keyboardShouldPersistTaps="handled" // Automatically dismisses the keyboard when tapping outside inputs
		>
			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Timer Picker
				</Text>
				<TimerPickerCard theme={theme} />
			</View>

			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Temperature Picker
				</Text>
				<TemperaturePickerCard theme={theme} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexGrow: 1, // Changed from flex: 1 to flexGrow: 1 for ScrollView compatibility
		justifyContent: "center",
		paddingHorizontal: 20,
		paddingVertical: 40, // Added vertical padding so the cards don't hit the screen edges
		backgroundColor: "transparent",
		gap: 40, // Adds space between the two cards
	},
	block: {
		gap: 16,
		width: "100%",
		alignItems: "center",
	},
	label: {
		fontFamily: "aera_semibold",
		fontSize: 14,
		opacity: 0.6,
		textTransform: "uppercase",
		textAlign: "center",
	},
});
