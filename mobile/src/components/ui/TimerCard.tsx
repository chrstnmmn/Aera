import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PausePlayButton from "./PausePlayButton";
import CancelButton from "./CancelButton";
import ProgressBar from "./ProgressBar";
import ActiveDryingSunIcon from "../icons/ActiveDryingSunIcon";

interface Props {
	theme: any;
	time: string;
	isHrMin: boolean;
	progress: number;
	percentage: number;
	onCancel: () => void;
	isPaused: boolean;
	onPauseToggle: () => void;
}

const TimerCard: React.FC<Props> = ({
	theme,
	time,
	isHrMin,
	progress,
	percentage,
	onCancel,
	isPaused,
	onPauseToggle,
}) => {
	const isDarkMode = theme.background === "#060606";
	const textColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

	return (
		<View
			key={isDarkMode ? "timer-dark" : "timer-light"}
			style={[
				styles.base,
				{ backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
				isDarkMode && styles.darkBorder,
			]}
		>
			{/* THE OVERLAY BOX (Top Section) */}
			<View
				style={[
					styles.overlay,
					{ backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
					isDarkMode && styles.darkBorder,
				]}
			>
				{/* LEFT COLUMN: Title, Progress, Stats */}
				<View style={styles.leftColumn}>
					<Text
						style={[styles.titleText, { color: textColor }]}
						numberOfLines={1}
					>
						Now Drying
					</Text>

					<View style={styles.progressContainer}>
						{/* FIXED: Passing percentage (0-100) instead of decimal progress to match ProgressBar's expected scale */}
						<ProgressBar
							theme={theme}
							progress={percentage}
							height={4}
						/>
					</View>

					<View style={styles.statsRow}>
						<View style={styles.sunIconWrapper}>
							<ActiveDryingSunIcon
								fill={textColor}
								width={38}
								height={25}
							/>
						</View>
						<View style={styles.percentContainer}>
							{/* Displays live numerical completion percentage */}
							<Text
								style={[
									styles.percentText,
									{ color: textColor },
								]}
							>
								{percentage}%
							</Text>
							<Text
								style={[styles.unitText, { color: textColor }]}
							>
								{isHrMin ? "hr : min" : "min : sec"}
							</Text>
						</View>
					</View>
				</View>

				{/* RIGHT COLUMN: Giant Timer */}
				<View style={styles.rightColumn}>
					<Text style={[styles.timerText, { color: textColor }]}>
						{time}
					</Text>
				</View>
			</View>

			{/* BOTTOM SECTION (Button Area) */}
			<View style={styles.bottomArea}>
				<PausePlayButton isPaused={isPaused} onPress={onPauseToggle} />
				<CancelButton onPress={onCancel} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	base: {
		width: "100%",
		minHeight: 170,
		borderRadius: 20,
		elevation: 8,
		shadowColor: "#000",
	},
	overlay: {
		width: "100%",
		minHeight: 110,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		borderBottomRightRadius: 20,
		borderBottomLeftRadius: 20,
		elevation: 8,
		shadowColor: "#000",
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 12,
		alignItems: "center",
	},
	darkBorder: { borderWidth: 1, borderColor: "rgba(217, 217, 217, 0.50)" },
	leftColumn: { flex: 1, paddingRight: 15 },
	titleText: { fontFamily: "aera_bold", fontSize: 21, marginBottom: 4 },
	progressContainer: { marginBottom: 2 },
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	percentContainer: { alignItems: "flex-end" },
	percentText: { fontFamily: "aera_tallsmall", fontSize: 28, lineHeight: 22 },
	sunIconWrapper: { transform: [{ translateY: -4 }] },
	unitText: { fontFamily: "aera_medium", fontSize: 12, opacity: 0.8 },
	rightColumn: { justifyContent: "center", alignItems: "flex-end" },
	timerText: {
		fontFamily: "aera_tallmedium",
		fontSize: 100,
		lineHeight: 75,
		letterSpacing: -1,
	},
	bottomArea: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 14,
	},
});

export default TimerCard;
