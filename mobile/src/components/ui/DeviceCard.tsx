import React, { useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Animated,
	Platform,
} from "react-native";
import HardwareIcon from "../icons/HardwareIcon";

interface Props {
	theme: any;
	onConnect?: () => void;
	deviceName?: string;
}

const DeviceCard: React.FC<Props> = ({
	theme,
	onConnect,
	deviceName = "Aera Nano",
}) => {
	const isDarkMode = theme.background === "#060606";
	const leftBoxBg = isDarkMode ? "#141414" : "#E7E7E7";
	const blueBoxBg = isDarkMode ? "#1CA7ED" : "#1497D9";
	const boxTextColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = () => {
		Animated.spring(scaleAnim, {
			toValue: 0.96,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			friction: 4,
			useNativeDriver: true,
		}).start();
	};

	return (
		<View style={[styles.blueBase, { backgroundColor: blueBoxBg }]}>
			{/* 1. LEFT BOX (The Overlay) */}
			<View
				style={[
					styles.grayOverlay,
					{
						backgroundColor: leftBoxBg,
						// We keep the light mode choke, but ensure dark mode has contrast
						borderColor: isDarkMode
							? "rgba(255, 255, 255, 0.3)"
							: "rgba(0,0,0,0.05)",
						borderWidth: 1,
						// This ensures the right-side line is specifically rendered
						borderRightWidth: isDarkMode ? 1.5 : 1,
					},
				]}
			>
				<HardwareIcon fill={boxTextColor} />
				<Text
					style={[styles.deviceName, { color: boxTextColor }]}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{deviceName}
				</Text>
			</View>

			{/* 2. RIGHT SECTION (Text & Control) */}
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={onConnect}
				style={styles.buttonHitbox}
			>
				<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
					<Text style={styles.connectBtnText}>Connect</Text>
				</Animated.View>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	blueBase: {
		width: "100%",
		height: 66,
		borderRadius: 20,
		flexDirection: "row",
		overflow: "hidden",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.15,
				shadowRadius: 6,
			},
			android: {
				elevation: 6,
			},
		}),
	},
	grayOverlay: {
		flex: 1,
		height: "100%",
		borderTopLeftRadius: 20,
		borderBottomLeftRadius: 20,
		borderTopRightRadius: 15,
		borderBottomRightRadius: 15,
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 20,
		paddingRight: 15,
		gap: 12,
	},
	deviceName: {
		flex: 1,
		fontFamily: "aera_medium",
		fontSize: 19,
		letterSpacing: -0.4,
	},
	buttonHitbox: {
		paddingHorizontal: 25,
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	connectBtnText: {
		color: "#E7E7E7",
		fontFamily: "aera_bold",
		fontSize: 16,
		letterSpacing: -0.2,
	},
});

export default DeviceCard;
