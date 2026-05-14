import React from "react";
import { View, Text, StyleSheet } from "react-native";

import AeraIcon from "../components/icons/AeraIcon";

interface Props {
	theme: any;
}

export default function Preview({ theme }: Props) {
	return (
		<View style={styles.content}>
			{<AeraIcon color={theme.text} size={21} />}
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
