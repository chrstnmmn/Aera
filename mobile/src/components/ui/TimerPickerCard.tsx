import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
	theme: any;
}

const LeftArrow = ({ fill }: { fill: string }) => (
	<Svg width={4} height={7} viewBox="0 0 4 7" fill="none">
		<Path
			d="M1.174 3.23 3.58.825a.486.486 0 0 0-.687-.688l-2.75 2.75a.486.486 0 0 0 0 .688l2.75 2.75a.486.486 0 0 0 .687-.687z"
			fill={fill}
		/>
	</Svg>
);

const RightArrow = ({ fill }: { fill: string }) => (
	<Svg width={4} height={7} viewBox="0 0 4 7" fill="none">
		<Path
			d="M2.543 3.231.136 5.638a.486.486 0 0 0 .688.687l2.75-2.75a.486.486 0 0 0 0-.688L.825.137a.486.486 0 0 0-.688.687z"
			fill={fill}
		/>
	</Svg>
);

const TimerPickerCard: React.FC<Props> = ({ theme }) => {
	const isDarkMode = theme?.background === "#060606";

	const [leftVal, setLeftVal] = useState("");
	const [rightVal, setRightVal] = useState("");
	const [isMinSec, setIsMinSec] = useState(true);

	const [focusedField, setFocusedField] = useState<"left" | "right" | null>(
		null,
	);

	const baseBg = isDarkMode ? "#141414" : "#E7E7E7";
	const focalBg = isDarkMode ? "#E7E7E7" : "#2E2E2E";
	const titleColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
	const activeNumberColor = isDarkMode ? "#2E2E2E" : "#FFFFFF";

	const handleFormatToggle = () => {
		const currentLeft = parseInt(leftVal, 10) || 0;
		const currentRight = parseInt(rightVal, 10) || 0;

		const formatForState = (n: number) =>
			n === 0 ? "" : String(n).padStart(2, "0");

		if (isMinSec) {
			const totalMinutes = currentLeft;
			let hours = Math.floor(totalMinutes / 60);
			let minutes = totalMinutes % 60;

			if (hours >= 12) {
				hours = 12;
				minutes = 0;
			}

			setLeftVal(formatForState(hours));
			setRightVal(formatForState(minutes));
			setIsMinSec(false);
		} else {
			const totalMinutes = currentLeft * 60 + currentRight;
			let minutes = totalMinutes;
			let seconds = 0;

			if (minutes > 60) {
				minutes = 60;
				seconds = 0;
			}

			setLeftVal(formatForState(minutes));
			setRightVal(formatForState(seconds));
			setIsMinSec(true);
		}
	};

	const handleLeftChange = (text: string) => {
		const digits = text.replace(/[^0-9]/g, "");
		const num = parseInt(digits, 10) || 0;

		if (num === 0) {
			setLeftVal("");
			return;
		}

		if (isMinSec) {
			if (num >= 60) {
				let hours = Math.floor(num / 60);
				let minutes = num % 60;
				if (hours >= 12) {
					hours = 12;
					minutes = 0;
				}
				setLeftVal(String(hours).padStart(2, "0"));
				setRightVal(
					minutes === 0 ? "" : String(minutes).padStart(2, "0"),
				);
				setIsMinSec(false);
			} else {
				setLeftVal(num.toString());
			}
		} else {
			if (num >= 12) {
				setLeftVal("12");
				setRightVal("");
			} else {
				setLeftVal(num.toString());
			}
		}
	};

	const handleRightChange = (text: string) => {
		const digits = text.replace(/[^0-9]/g, "");
		const num = parseInt(digits, 10) || 0;
		const leftParsed = parseInt(leftVal, 10) || 0;

		if (num === 0) {
			setRightVal("");
			return;
		}

		if (isMinSec) {
			if (num >= 60) {
				const additionalMinutes = Math.floor(num / 60);
				const remainingSeconds = num % 60;
				const totalMinutes = leftParsed + additionalMinutes;

				if (totalMinutes >= 60) {
					let hours = Math.floor(totalMinutes / 60);
					let minutes = totalMinutes % 60;
					if (hours >= 12) {
						hours = 12;
						minutes = 0;
					}
					setLeftVal(String(hours).padStart(2, "0"));
					setRightVal(
						minutes === 0 ? "" : String(minutes).padStart(2, "0"),
					);
					setIsMinSec(false);
				} else {
					setLeftVal(String(totalMinutes).padStart(2, "0"));
					setRightVal(
						remainingSeconds === 0
							? ""
							: String(remainingSeconds).padStart(2, "0"),
					);
				}
			} else {
				setRightVal(num.toString());
			}
		} else {
			if (num >= 60) {
				const additionalHours = Math.floor(num / 60);
				const remainingMinutes = num % 60;
				let totalHours = leftParsed + additionalHours;

				if (totalHours >= 12) {
					setLeftVal("12");
					setRightVal("");
				} else {
					setLeftVal(String(totalHours).padStart(2, "0"));
					setRightVal(
						remainingMinutes === 0
							? ""
							: String(remainingMinutes).padStart(2, "0"),
					);
				}
			} else {
				setRightVal(num.toString());
			}
		}
	};

	const handleBlur = (val: string, setter: (val: string) => void) => {
		const num = parseInt(val, 10) || 0;
		if (num === 0) {
			setter("");
		} else {
			setter(String(num).padStart(2, "0"));
		}
	};

	// THE FIX: Simplified! It now always returns "00" if the state is empty, so it never vanishes.
	const getDisplayText = (val: string) => {
		if (val === "") {
			return "00";
		}
		return val;
	};

	return (
		<View
			style={[
				styles.baseCard,
				{ backgroundColor: baseBg },
				isDarkMode && styles.darkBorder,
			]}
			key={isDarkMode ? "timerpicker-dark" : "timerpicker-light"}
		>
			<View style={styles.titleContainer}>
				<Text style={[styles.title, { color: titleColor }]}>
					Set Timer
				</Text>
			</View>

			<View style={[styles.focalBox, { backgroundColor: focalBg }]}>
				{/* LEFT INPUT WRAPPER */}
				<View style={styles.inputWrapper}>
					<Text
						style={[
							styles.mainNumberInput,
							styles.visibleDisplay,
							{
								color: activeNumberColor,
								opacity: focusedField === "right" ? 0.3 : 1,
							},
						]}
					>
						{getDisplayText(leftVal)}
					</Text>

					<TextInput
						style={[
							styles.mainNumberInput,
							{ color: "transparent" },
						]}
						value={leftVal}
						onChangeText={handleLeftChange}
						onFocus={() => {
							setFocusedField("left");
						}}
						onBlur={() => {
							handleBlur(leftVal, setLeftVal);
							setFocusedField(null);
						}}
						keyboardType="number-pad"
						selectTextOnFocus={true}
						autoCorrect={false}
						spellCheck={false}
						scrollEnabled={false}
						multiline={false}
						maxLength={2}
						caretHidden={true}
						selectionColor="transparent"
					/>
				</View>

				<Text
					style={[
						styles.colonText,
						{
							color: activeNumberColor,
							opacity: focusedField ? 0.3 : 1,
						},
					]}
				>
					:
				</Text>

				{/* RIGHT INPUT WRAPPER */}
				<View style={styles.inputWrapper}>
					<Text
						style={[
							styles.mainNumberInput,
							styles.visibleDisplay,
							{
								color: activeNumberColor,
								opacity: focusedField === "left" ? 0.3 : 1,
							},
						]}
					>
						{getDisplayText(rightVal)}
					</Text>

					<TextInput
						style={[
							styles.mainNumberInput,
							{ color: "transparent" },
						]}
						value={rightVal}
						onChangeText={handleRightChange}
						onFocus={() => {
							setFocusedField("right");
						}}
						onBlur={() => {
							handleBlur(rightVal, setRightVal);
							setFocusedField(null);
						}}
						keyboardType="number-pad"
						selectTextOnFocus={true}
						autoCorrect={false}
						spellCheck={false}
						scrollEnabled={false}
						multiline={false}
						maxLength={2}
						caretHidden={true}
						selectionColor="transparent"
					/>
				</View>
			</View>

			<View style={styles.footerContainer}>
				<Pressable
					style={styles.footerToggleRow}
					onPress={handleFormatToggle}
				>
					<LeftArrow fill={titleColor} />
					<Text style={[styles.formatText, { color: titleColor }]}>
						{isMinSec ? "min : sec" : "hr : min"}
					</Text>
					<RightArrow fill={titleColor} />
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	baseCard: {
		width: "100%",
		height: 217.27,
		borderRadius: 20,
		paddingHorizontal: 28,
		elevation: 8,
		shadowColor: "#000",
	},
	darkBorder: {
		borderWidth: 1,
		borderColor: "rgba(217, 217, 217, 0.50)",
	},
	titleContainer: {
		height: 58,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 14,
	},
	focalBox: {
		width: "100%",
		height: 114.69,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
		elevation: 4,
		shadowColor: "#000",
	},
	inputWrapper: {
		height: 100,
		width: 105,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	visibleDisplay: {
		position: "absolute",
		zIndex: 1,
		pointerEvents: "none",
	},
	footerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 4,
	},
	title: {
		fontFamily: "aera_heavy",
		fontSize: 16,
		lineHeight: 21,
		includeFontPadding: false,
	},
	mainNumberInput: {
		fontFamily: "aera_tallcompressed",
		fontSize: 100,
		lineHeight: 100,
		height: 100,
		width: 105,
		textAlignVertical: "center",
		includeFontPadding: false,
		textAlign: "center",
		padding: 0,
		margin: 0,
	},
	colonText: {
		fontFamily: "aera_tallcompressed",
		fontSize: 100,
		lineHeight: 100,
		includeFontPadding: false,
		textAlign: "center",
		paddingBottom: 14,
	},
	footerToggleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	formatText: {
		fontFamily: "aera_bold",
		fontSize: 16,
		lineHeight: 21,
		includeFontPadding: false,
		textAlign: "center",
	},
});

export default TimerPickerCard;
