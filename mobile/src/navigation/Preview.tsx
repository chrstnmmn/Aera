import React from "react";
import { View, StyleSheet } from "react-native";
import SystemMonitor from "../components/ui/SystemMonitor";

export default function Preview({ theme }: { theme: any }) {
	return (
		<View style={[styles.content, { backgroundColor: theme.background }]}>
			<SystemMonitor theme={theme} />
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
});
