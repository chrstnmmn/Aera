import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";

//Assets
import RightArrowIcon from "./assets/right-arrow-icon.svg";
import PowerPlugIcon from "./PowerPlugIcon";

const { width, height } = Dimensions.get("window");

interface Props {
	theme: any;
	onNext: () => void;
}

const PowerUpScreen: React.FC<Props> = ({ theme, onNext }) => {
	return (
		<View style={styles.content}>
			<View style={styles.textWrapperPowerUp}>
				<Text style={[styles.massiveText, { color: theme.text }]}>
					Power Up
				</Text>
				<Text style={[styles.subText, { color: theme.text }]}>
					Make sure your Aera is plugged in
				</Text>
			</View>

			<View style={styles.bottomControlsWrapper}>
				<View style={styles.plugGraphicWrapper}>
					<PowerPlugIcon
						width={width * 0.85}
						height={height * 0.58}
						// Use boxGraphic: It is #00A0E9 in Light, and #E7E7E7 in Dark
						fill={theme.boxGraphic}
					/>
				</View>

				<TouchableOpacity
					style={styles.nextBtn}
					activeOpacity={0.7}
					onPress={onNext}
				>
					<Text
						style={[
							styles.getStartedText,
							{ color: theme.primaryBlue },
						]}
					>
						Next
					</Text>
					<RightArrowIcon
						width={16}
						height={16}
						fill={theme.primaryBlue}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 20,
		justifyContent: "space-between",
	},
	massiveText: {
		fontSize: 64,
		fontFamily: "aera_black",
		lineHeight: 70,
		letterSpacing: -1.5,
		marginTop: 55,
	},
	subText: {
		fontSize: 16,
		fontFamily: "aera_medium",
		marginTop: -2,
		marginLeft: 2,
	},
	textWrapperPowerUp: { marginTop: height * 0.28 },
	bottomControlsWrapper: {
		flex: 1,
		justifyContent: "flex-end",
		paddingBottom: 40,
	},
	nextBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		alignSelf: "flex-end",
	},
	getStartedText: { fontSize: 16, fontFamily: "aera_bold" },
	plugGraphicWrapper: {
		position: "absolute",
		bottom: -20,
		transform: [{ translateX: -40 }, { translateY: 60 }],
		zIndex: -1,
	},
});

export default PowerUpScreen;
