import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
	theme: any;
	progress: number; // Expects a value from 0 to 100
	height?: number;
}

const ProgressBar: React.FC<Props> = ({ theme, progress, height = 4 }) => {
	const isDarkMode = theme.background === "#060606";

	// Ensure the progress value stays safely within 0 and 100
	const clampedProgress = Math.max(0, Math.min(100, progress));

	return (
		// ProgressBarBg
		<View style={[styles.bg, { height }]}>
			{/* ProgressBar (Active fill) */}
			<View
				style={[
					styles.fill,
					{
						width: `${clampedProgress}%`,
						backgroundColor: isDarkMode ? "#E7E7E7" : "#2E2E2E",
					},
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	bg: {
		width: "100%",
		backgroundColor: "rgba(161, 161, 161, 0.75)",
		borderRadius: 20,
		// Prevents the inner square corners from breaking out of the rounded background
		overflow: "hidden",
	},
	fill: {
		height: "100%",
		borderRadius: 20,
	},
});

export default ProgressBar;
