import React from "react";
import { View, Text, StyleSheet } from "react-native";

import AeraIcon from "../components/icons/AeraIcon";
import WifiIconTitleBar from "../components/icons/WifiIconTitleBar";
import CloudConnectedIconTitleBar from "../components/icons/CloudConnectedIconTitleBar";
import CloudDisconnectedIconTitleBar from "../components/icons/CloudDisconnectedIconTitleBar";
import SetupTimerIconTitleBar from "../components/icons/SetupTimerIconTitleBar";
import MyPresetMenuIcon from "../components/icons/MyPresetMenuIcon";
import SettingsIconTitlebar from "../components/icons/SettingsIconTitlebar";
import AeraTitlebar from "../components/ui/AeraTitlebar";

interface Props {
	theme: any;
}

export default function Preview({ theme }: Props) {
	return (
		<View style={styles.content}>
			<AeraTitlebar mode="dashboard" theme={theme} status="connected" />
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
