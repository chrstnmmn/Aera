import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import WizardSuccessBox from "./WizardSuccessBox";
import RightArrowIcon from "./assets/right-arrow-icon.svg";


const { width, height } = Dimensions.get("window");

interface Props {
	theme: any;
	onNext: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ theme, onNext }) => {
	return (
		<View style={styles.content}>
			<View style={styles.textWrapperWelcome}>
				{/* Swapped to SF-Black for that punchy massive look */}
				<Text style={[styles.massiveText, { color: theme.text }]}>
					Welcome
				</Text>

				<TouchableOpacity
					style={styles.getStartedBtn}
					activeOpacity={0.7}
					onPress={onNext}
				>
					{/* Swapped to SF-Bold for the button action */}
					<Text
						style={[
							styles.getStartedText,
							{ color: theme.primaryBlue },
						]}
					>
						Lets get started
					</Text>
					<RightArrowIcon
						width={18}
						height={18}
						fill={theme.primaryBlue}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.welcomeGraphicWrapper}>
				<WizardSuccessBox
					width={width * 0.95}
					height={height * 0.65}
					primaryFill={theme.boxGraphic}
					glassFill={theme.background}
				/>
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
		// --- FONT TWEAKS ---
		fontFamily: "aera_black", // Using your registered key
		fontWeight: "normal",
		fontSize: 65,
		lineHeight: 70,
		letterSpacing: -1.5,
		includeFontPadding: false, // Essential for Android vertical centering
	},
	textWrapperWelcome: {
		marginTop: height * 0.15,
		flexDirection: "column",
		alignItems: "flex-end",
	},
	getStartedBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginLeft: 120,
	},
	getStartedText: {
		// --- FONT TWEAKS ---
		fontFamily: "aera_bold", // Using your registered key
		fontWeight: "normal",
		fontSize: 16,
	},
	welcomeGraphicWrapper: {
		position: "absolute",
		bottom: -60,
		left: -20,
		zIndex: -1,
	},
});

export default WelcomeScreen;
