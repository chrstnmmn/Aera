import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import CancelIcon from "../icons/CancelIcon";

interface Props {
	disabled?: boolean;
	onPress?: () => void;
}

const CancelButton: React.FC<Props> = ({ disabled = false, onPress }) => {
	// White when active, matches the disabled SVG color when inactive
	const contentColor = disabled ? "rgba(54, 54, 54, 0.5)" : "#FFFFFF";

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				pressed && !disabled && styles.buttonPressed,
				disabled && styles.buttonDisabled,
			]}
		>
			{/* TEXT IS NOW ON THE LEFT */}
			<Text style={[styles.label, { color: contentColor }]}>
				Stop Drying
			</Text>

			{/* ICON IS NOW ON THE RIGHT */}
			<View style={styles.iconContainer}>
				<CancelIcon fill={contentColor} width={15} height={15} />
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#D52222",
		paddingVertical: 4,
		paddingHorizontal: 14,
		borderRadius: 100, // Pill shape
		elevation: 6,
		shadowColor: "#000",
	},
	buttonPressed: {
		opacity: 0.8,
		elevation: 2,
	},
	buttonDisabled: {
		elevation: 1,
	},
	iconContainer: {
		width: 16,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 6, // Margin is now on the left to separate from the text
	},
	label: {
		fontFamily: "aera_medium",
		fontSize: 12,
	},
});

export default CancelButton;
